import { SingleBar } from 'cli-progress'
import fetch from 'node-fetch'

import { getDatabase } from '../src/automation/database'
import { getArtifactSet, getStatKey } from '../src/automation/util/scraper'
import { asCommand } from './types'

const timeInSecondsUTC = (date: Date) => {
  return Math.trunc(date.getTime() / 1000)
}
const currentTimeSeconds = () => {
  return timeInSecondsUTC(new Date())
}
// TODO: scrape data from other languages
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
    request.searchParams.set('order', 'CreatedTime')
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

const LOCAL_DOC_KEY = 'sync-time'
type LocalDoc = {
  time: number
}

async function createStatistics() {
  const db = await getDatabase()
  let localDoc = await db.default.getLocal<LocalDoc>(LOCAL_DOC_KEY)
  if (localDoc === null) {
    localDoc = await db.default.insertLocal<LocalDoc>(LOCAL_DOC_KEY, {
      // Set initial time to when the lineup simulator was released
      time: timeInSecondsUTC(new Date('2022/10/27')),
    })
  }
  const lastSyncTime: number = localDoc.get('time')
  console.log(`Last sync at ${new Date(lastSyncTime * 1000)}.`)
  const currentTime = currentTimeSeconds()
  await db.default.upsertLocal<LocalDoc>(LOCAL_DOC_KEY, { time: currentTime })
  const bar = new SingleBar({
    format: '\u2595{bar}\u258F {percentage}% | ETA: {eta}s | builds: {builds}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  })
  let finishStatus = 'Reached the end.'
  let lastCreatedAt = currentTime
  let totalBuilds = 0
  bar.start(currentTime - lastSyncTime, 0, {
    builds: 0
  })
  for await (const teams of fetchLineupSimulatorBuilds()) {
    const createdAt = Number.parseInt(teams.created_at)
    if (createdAt < lastSyncTime) {
      finishStatus = 'Caught up with old data'
      bar.update(bar.getTotal())
      break
    } else if (createdAt > lastCreatedAt) {
      finishStatus = 'Broke order'
      break
    }
    bar.update(currentTime - createdAt, {
      builds: totalBuilds
    })
    lastCreatedAt = createdAt
    for (const team of teams.avatar_group) {
      for (const character of team.group) {
        totalBuilds += 1
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
                doc = await db.default.insert({
                  ...row,
                  popularity: 0,
                  rarity: 0,
                })
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
  }
  bar.stop()
  console.log(finishStatus)
  await db.destroy()
  process.exit()
}


export const command = asCommand({
  command: 'popularity',
  describe: 'Scrapes character loadout data from the lineup simulator: https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html',
  builder: {},
  handler: () => {
    createStatistics()
  }
})