import os from 'os'
import path from 'path'

import {
  createWorker,
  createScheduler,
  PSM,
  ImageLike,
  RecognizeOptions,
} from 'tesseract.js'

// TODO: Fix brute-force pathing to this static asset
const tessPath = path.resolve(__dirname, 'tessdata')

export class OCR {
  scheduler = createScheduler()

  constructor(num_workers = os.cpus().length) {
    for (let i = 0; i < num_workers; i++) {
      this.#addWorker()
    }
  }

  async #addWorker() {
    const worker = await createWorker({
      langPath: tessPath,
      gzip: false,
      cacheMethod: 'none',
      // logger: console.debug,
    })

    await worker.loadLanguage('genshin_best_eng')
    await worker.initialize('genshin_best_eng')
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
    })

    this.scheduler.addWorker(worker)
  }

  async recognize(image: ImageLike, options?: Partial<RecognizeOptions>) {
    return this.scheduler
      .addJob('recognize', image, options)
      .then(({ data }) => data.text)
  }
}
