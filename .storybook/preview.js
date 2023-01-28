import { lightTheme, darkTheme, theme } from '../src/stitches.config'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  multipleThemesStitches: {
    values: [
      {
        name: 'Light',
        theme: lightTheme,
      },
      {
        name: 'Dark',
        theme: darkTheme,
      },
    ],
  },
  backgrounds: {
    default: 'default',
    values: [
      {
        name: 'default',
        value: theme.colors.appBackground,
      },
    ],
  },
}
