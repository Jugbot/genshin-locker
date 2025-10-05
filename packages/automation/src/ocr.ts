import os from 'os'
import path from 'path'

import {
  createScheduler,
  createWorker,
  ImageLike,
  OEM,
  PSM,
  RecognizeOptions,
} from 'tesseract.js'

// TODO: Fix brute-force pathing to this static asset
const tessPath = path.resolve(__dirname, 'tessdata')

export async function createOCR(maxWorkers = os.cpus().length) {
  const scheduler = createScheduler()

  await Promise.all(Array.from({ length: maxWorkers }, addWorker))

  async function addWorker() {
    const worker = await createWorker('genshin_best_eng', OEM.DEFAULT, {
      langPath: tessPath,
      gzip: false,
      cacheMethod: 'none',
      // logger: console.debug,
    })

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      user_defined_dpi: '70',
    })

    scheduler.addWorker(worker)
  }

  async function recognize(
    image: ImageLike,
    options?: Partial<RecognizeOptions>
  ) {
    return scheduler
      .addJob('recognize', image, options)
      .then(({ data }) => data.text)
  }

  return {
    recognize,
  }
}
