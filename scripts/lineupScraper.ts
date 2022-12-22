import { getArtifactSet, getStatKey } from '../src/automation/util/scraper'
import fs from 'fs'
import path from 'path'
import { combinations } from '../src/automation/util/statistics'

type Payload = {
  data: {
    next_page_token: string
    list: Array<{
      id: string
      account_uid: string
      nickname: string
      avatar_url: string
      level: number
      title: string
      tag_ids: Array<number>
      avatar_group: Array<{
        group: Array<{
          id: number
          name: string
          icon: string
          element: number
          level: number
          weapon_cat_id: number
          weapon: {
            id: number
            name: string
            icon: string
            level: number
            cat_id: number
            wiki_url: string
          }
          set_list: Array<{
            id: number
            name: string
            icon: string
            level: number
            attr_id: number
            cat_id: number
            wiki_url: string
          }>
          wiki_url: string
          avatar_tag: {
            id: number
            name: string
            color: string
          }
          first_attr: Array<{
            cat_id: number
            id: number
            name: string
          }>
          secondary_attr: []
          secondary_attr_name: Array<{
            id: number
            name: string
          }>
          head_icon: string
          pc_icon: string
        }>
      }>
      quick_avatar: []
      description: string
      like_cnt: number
      comment_cnt: number
      favour_cnt: number
      view_cnt: number
      is_favour: boolean
      is_like: boolean
      status: number
      is_deleted: boolean
      created_at: string
      group_cnt: number
      trans: boolean
      origin_title: string
      origin_desc: string
      tag_name: []
      trans_from: string
    }>
  }
}

async function* fetchLineupSimulatorBuilds(limit = 1000) {
  let nextPageToken = ''
  while (nextPageToken !== null) {
    const request = new URL(
      'https://sg-public-api.hoyolab.com/event/simulatoros/lineup/index'
    )
    request.searchParams.set('limit', `${limit}`)
    request.searchParams.set('next_page_token', nextPageToken)
    request.searchParams.set('tag_id', '2')
    request.searchParams.set('roles', '')
    request.searchParams.set('order', 'Hot')
    request.searchParams.set('lang', 'en-us')
    const data = await fetch(request)
    const jsonData = (await data.json()) as Payload
    nextPageToken = jsonData.data['next_page_token']
    yield* jsonData.data['list']
  }
}

async function createStatistics(limit = 100_000) {
  const results: Record<string, number> = {}
  const totals = {
    characters: 0,
    artifactSets: 0,
    substats: 0,
    substatPairs: 0,
  }
  let count = 0
  for await (const teams of fetchLineupSimulatorBuilds()) {
    for (const team of teams.avatar_group) {
      for (const character of team.group) {
        totals.characters += 1
        for (const artifactSet of character.set_list) {
          totals.artifactSets += 1
          setOrIncrement(results, ['set', getArtifactSet(artifactSet['name'])])
        }
        const [sands, goblet, circlet] = character.first_attr.sort(
          (a, b) => a.cat_id - b.cat_id
        )
        setOrIncrement(results, ['slot', 'sands', getStatKey(sands.name)])
        setOrIncrement(results, ['slot', 'goblet', getStatKey(goblet.name)])
        setOrIncrement(results, ['slot', 'circlet', getStatKey(circlet.name)])
        const substatKeys = character.secondary_attr_name.map((stat) =>
          getStatKey(stat.name)
        )
        for (const substat of substatKeys) {
          totals.substats += 1
          setOrIncrement(results, ['substat', substat])
        }
        for (const [keyA, keyB] of combinations(substatKeys)) {
          totals.substatPairs += 1
          setOrIncrement(results, ['association', keyA, keyB])
          setOrIncrement(results, ['association', keyB, keyA])
        }
        count += 1
      }
    }
    if (count > limit) break
  }
  setOrIncrement(results, ['slot', `flower`, 'hp'], totals['characters'])
  setOrIncrement(results, ['slot', `plume`, 'atk'], totals['characters'])

  for (const artifactSet in deepGet(results, ['set'])) {
    deepSet(
      results,
      ['set', artifactSet],
      (value: number) => value / totals.artifactSets
    )
  }
  for (const artifactSlot in deepGet(results, ['slot'])) {
    for (const artifactStat in deepGet(results, ['slot', artifactSlot])) {
      deepSet(
        results,
        ['slot', artifactSlot, artifactStat],
        (value: number) => value / totals.characters
      )
    }
  }
  for (const artifactStat in deepGet(results, ['substat'])) {
    deepSet(
      results,
      ['substat', artifactStat],
      (value: number) => value / totals.substats
    )
  }
  for (const artifactStatA in deepGet(results, ['association'])) {
    for (const artifactStatB in deepGet(results, [
      'association',
      artifactStatA,
    ])) {
      deepSet(
        results,
        ['association', artifactStatA, artifactStatB],
        (value: number) => value / totals.substatPairs
      )
    }
  }

  return results
}

const deepGet = (data: Record<string, unknown>, keys: string[]) => {
  let deepData = data
  for (const key of keys) {
    if (!(key in deepData)) {
      deepData[key] = {}
    }
    deepData = deepData[key] as Record<string, unknown>
  }
  return deepData
}

const deepSet = (
  data: Record<string, unknown>,
  keys: string[],
  value: (existing: unknown) => unknown
): void => {
  const deepData = deepGet(data, keys.slice(0, -1))
  const key = keys.at(-1) as string
  deepData[key] = value(deepData[key])
}

const setOrIncrement = (
  data: Record<string, unknown>,
  keys: string[],
  value = 1
): void => {
  deepSet(data, keys, (prev) => ((prev as number) ?? 0) + value)
}

createStatistics().then((data) =>
  fs.writeFileSync(
    path.join(__dirname, '../src/automation/crowdsourced/crowdsourced.json'),
    JSON.stringify(data, null, 2)
  )
)
