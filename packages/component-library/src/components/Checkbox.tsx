import { styled } from '@gl/theme'
import * as RadixCheckbox from '@radix-ui/react-checkbox'

const CheckboxRoot = styled(RadixCheckbox.Root, {
  all: 'unset', // reset button styles
  backgroundColor: '$bgActionSubdued',
  width: '$size6',
  height: '$size6',
  borderRadius: '$radius1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '&:hover': {
    backgroundColor: '$bgActionSubduedHover',
  },
  '&:focus': {
    boxShadow: '0 0 0 2px $colors$textActionSubdued inset',
  },
})

const CheckboxIndicator = styled(RadixCheckbox.Indicator, {
  color: '$textActionSubdued',
})

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
}
