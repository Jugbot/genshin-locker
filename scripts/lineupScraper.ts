import { getArtifactSet, getStatKey } from '../src/automation/util/scraper'
import fs from 'fs'
import path from 'path'
import { getDatabase } from '../src/automation/database'
import { SingleBar } from 'cli-progress'

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
    try {
      const data = await fetch(request)
      const jsonData = (await data.json()) as Payload
      nextPageToken = jsonData.data['next_page_token']
      yield* jsonData.data['list']
    } catch (e) {
      console.error(e)
    }
  }
}

async function createStatistics(limit = 100_000) {
  const db = await getDatabase(false)
  let count = 0
  const bar = new SingleBar({})
  bar.start(limit, 0)
  for await (const teams of fetchLineupSimulatorBuilds()) {
    for (const team of teams.avatar_group) {
      for (const character of team.group) {
        count += 1
        bar.increment(1)
        const substatKeys = character.secondary_attr_name.map((stat) =>
          getStatKey(stat.name)
        )
        for (const artifactSet of character.set_list) {
          const [sands, goblet, circlet] = character.first_attr
            .sort((a, b) => a.cat_id - b.cat_id)
            .map((s) => s.name)
          const slots = {
            flower: 'HP',
            plume: 'ATK',
            sands,
            goblet,
            circlet,
          }
          for (const [type, mainStat] of Object.entries(slots)) {
            for (const substat of substatKeys) {
              const row = {
                set: getArtifactSet(artifactSet['name']),
                slot: type,
                main: getStatKey(mainStat),
                sub: substat,
              }
              let doc = await db.default
                .findOne({
                  selector: row,
                })
                .exec()
              if (!doc) {
                doc = await db.default.insert(row)
              }
              await doc.update({
                $inc: {
                  popularity: 1,
                },
              })
            }
          }
        }
      }
    }
    if (count > limit) break
  }
  bar.stop()
  return db.exportJSON()
}

createStatistics(10000).then((data) =>
  fs.writeFileSync(
    path.join(__dirname, '../src/automation/database/data.json'),
    JSON.stringify(data, null, 2)
  )
)
