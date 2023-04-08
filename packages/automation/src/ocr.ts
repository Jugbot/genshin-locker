import path from 'path'

import {
  createWorker,
  createScheduler,
  OEM,
  PSM,
  ImageLike,
  RecognizeOptions,
} from 'tesseract.js'

// TODO: Fix brute-force pathing to this static asset
const tessPath = path.resolve(__dirname, 'tessdata')

export class OCR {
  scheduler = createScheduler()

  constructor(num_workers = 1) {
    for (let i = 0; i < num_workers; i++) {
      this.#addWorker()
    }
  }

  async #addWorker() {
    const worker = await createWorker({
      langPath: tessPath,
      logger: (m) => console.info(m),
    })

    await worker.loadLanguage('genshin_best_eng')
    await worker.initialize('genshin_best_eng')
    await worker.setParameters({
      tessedit_ocr_engine_mode: OEM.DEFAULT,
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
