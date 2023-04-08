import { DecoratorFn } from '@storybook/react'
import { useDarkMode } from 'storybook-dark-mode'

import { Box } from '../../src/components'
import { darkTheme, lightTheme } from '../../src/stitches.config'

export const ThemeDecorator: DecoratorFn = (renderStory) => {
  return (
    <Box
      id="appStyled"
      css={{ display: 'contents' }}
      className={useDarkMode() ? darkTheme.className : lightTheme.className}
    >
      {renderStory()}
    </Box>
  )
}
