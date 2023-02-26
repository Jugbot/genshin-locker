import { use } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import resources from './locales'

export const initTranslations = () =>
  use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: true,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      resources,
    })

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['en']
  }
}
