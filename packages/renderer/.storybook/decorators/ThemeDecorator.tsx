import { DecoratorFn } from '@storybook/react'
import { useDarkMode } from 'storybook-dark-mode'

import { Box } from '@gl/component-library'
import { darkTheme, lightTheme } from '@gl/theme'

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
