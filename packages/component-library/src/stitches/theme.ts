import {
  blackA,
  blue,
  blueDark,
  green,
  greenDark,
  orange,
  orangeDark,
  purple,
  purpleDark,
  red,
  redDark,
  slate,
  slateDark,
  slateDarkA,
  whiteA,
  yellow,
  yellowDark,
} from '@radix-ui/colors'

import { fadeIn } from './keyframes'

// Constants for setting window button colors
export const MENUBAR_BACKCOLOR = slateDark.slate3
export const MENUBAR_COLOR = slateDark.slate12

const theme = {
  borderStyles: {},
  borderWidths: {
    borderWidth0: '0px',
    borderWidth1: '1px',
    borderWidth2: '2px',
    borderWidth3: '4px',
  },
  colors: {
    ...redDark,
    ...orangeDark,
    ...yellowDark,
    ...greenDark,
    ...blueDark,
    ...purpleDark,

    ...slateDark,
    ...slateDarkA,

    ...blackA,
    ...whiteA,

    bgPrimary: '$slate2',
    bgSecondary: '$slate4',
    bgSecondaryHover: '$slate5',
    bgTertiary: '$slate6',
    bgActionPrimary: '$slate9',
    bgActionPrimaryHover: '$slate10',
    bgActionPrimaryPressed: '$slate8',
    textActionPrimary: '$black2',
    bgActionSubdued: '$slate9',
    bgActionSubduedHover: '$slate10',
    bgActionSubduedPressed: '$slate8',
    textActionSubdued: '$white11',
    bgActionTransparent: 'transparent',
    bgActionTransparentHover: '$slateA4',
    bgActionTransparentPressed: '$slateA5',
    textActionTransparent: '$textDefault',
    bgActionNeutral: '$slate9',
    bgActionNeutralHover: '$slate10',
    bgActionNeutralPressed: '$slate8',
    textActionNeutral: '$slate2',
    textDefault: '$slate12',
    textInverted: '$slate8',
    textDisabled: '$slate11',
    menubarBackground: MENUBAR_BACKCOLOR,
    menubarColor: MENUBAR_COLOR,
    layoutHandle: '$slate8',
    layoutHandleHover: '$slate9',
    layoutHandlePressed: '$slate10',
  },
  fonts: {
    display: 'Arial',
    body: 'Arial',
  },
  fontSizes: {
    fontSize1: '0.75rem',
    fontSize2: '0.875rem',
    fontSize3: '1rem',
    fontSize4: '1.25rem',
    fontSize5: '1.5rem',
    fontSize6: '1.75rem',
    fontSize7: '2rem',
  },
  fontWeights: {
    regular: '400',
    bold: '500',
  },
  letterSpacings: {
    letterSpacing0: '0px',
    letterSpacing1: '0.3px',
    letterSpacing2: '0.5px',
  },
  lineHeights: {
    lineHeight1: '1',
    lineHeight2: '1.25',
    lineHeight3: '1.285',
    lineHeight4: '1.333',
    lineHeight5: '1.4',
    lineHeight6: '1.428',
    lineHeight7: '1.5',
  },
  radii: {
    radius1: '4px',
    radius2: '8px',
    radius3: '16px',
    radiusMax: '9999px',
  },
  shadows: {
    shadow1:
      '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
    shadowFocus: '0 0 0 2px black',
  },
  sizes: {
    size0: '0',
    size1: '4px',
    size2: '8px',
    size3: '12px',
    size4: '16px',
    size5: '20px',
    size6: '24px',
    size7: '28px',
    size8: '32px',
    size9: '36px',
    size10: '40px',
    size11: '44px',
    size12: '48px',
    size13: '52px',
    size14: '56px',
    size15: '60px',
    size16: '64px',
    divider1: '1px',
    divider2: '2px',
  },
  space: {
    space0: '0',
    space1: '4px',
    space2: '8px',
    space3: '12px',
    space4: '16px',
    space5: '20px',
    space6: '24px',
    space7: '28px',
    space8: '32px',
    space9: '36px',
    space10: '40px',
    space11: '44px',
    space12: '48px',
    space13: '52px',
    space14: '56px',
    space15: '60px',
    space16: '64px',
  },
  transitions: {},
  animations: {
    fadeIn: `${fadeIn} 300ms ease-out`,
  },
} as const

export const light = {
  ...theme,
  colors: {
    ...theme.colors,
    ...yellow,
    ...orange,
    ...red,
    ...purple,
    ...blue,
    ...green,
    ...slate,
  },
} as const

export const dark = {
  ...theme,
  colors: {
    ...theme.colors,
    ...yellowDark,
    ...orangeDark,
    ...redDark,
    ...purpleDark,
    ...blueDark,
    ...greenDark,
    ...slateDark,
  },
} as const

export default theme