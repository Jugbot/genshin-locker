import { DecoratorFn } from '@storybook/react'
import i18n, { changeLanguage, dir } from 'i18next'
import React from 'react'

import { initTranslations } from '../i18n'

initTranslations()

// When The language changes, set the document direction
i18n.on('languageChanged', (locale) => {
  const direction = dir(locale)
  document.dir = direction
})

export const LocalizationDecorator: DecoratorFn = (Story, context) => {
  const { locale } = context.globals

  React.useEffect(() => {
    changeLanguage(locale)
  }, [locale])

  return <Story />
}
