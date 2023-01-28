import { DecoratorFn } from '@storybook/react'
import { useDarkMode } from 'storybook-dark-mode'

import { Box } from '../components'
import { darkTheme, lightTheme } from '../stitches.config'

export const ThemeDecorator: DecoratorFn = (renderStory) => {
  return (
    <Box
      css={{ display: 'contents' }}
      className={useDarkMode() ? darkTheme.className : lightTheme.className}
    >
      {renderStory()}
    </Box>
  )
}
