import { DecoratorFn } from '@storybook/react'
import { useDarkMode } from 'storybook-dark-mode'

import { Box, darkTheme, lightTheme } from '@gl/component-library'

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
