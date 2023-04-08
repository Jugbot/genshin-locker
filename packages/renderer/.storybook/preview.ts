import { LocalizationDecorator, ThemeDecorator } from './decorators'
import resources from '../src/locales'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [ThemeDecorator, LocalizationDecorator]

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      items: Object.entries(resources).map(
        ([
          locale,
          {
            translation: { code, language },
          },
        ]) => ({
          value: locale,
          right: code,
          title: language,
        })
      ),
      dynamicTitle: true,
    },
  },
}
