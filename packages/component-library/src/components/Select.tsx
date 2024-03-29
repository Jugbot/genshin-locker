import { CSS, styled } from '@gl/theme'
import * as RadixSelect from '@radix-ui/react-select'
import * as React from 'react'

import { Button } from './Button'

const SelectTriggerRaw = styled(RadixSelect.Trigger)

// Instead of styling the trigger, use a <Button /> as the trigger
const SelectTrigger = (props: React.ComponentPropsWithRef<typeof Button>) => (
  <SelectTriggerRaw asChild>
    <Button {...props} />
  </SelectTriggerRaw>
)

const SelectIcon = styled(RadixSelect.Icon)

const SelectContent = styled(RadixSelect.Content, {
  overflow: 'hidden',
  backgroundColor: '$bgTertiary',
  borderRadius: '$radius1',
  width: 'fit-content',
})

const SelectViewport = styled(RadixSelect.Viewport, {
  padding: '$space1',
})

const SelectItem = styled(RadixSelect.Item, {
  borderRadius: '$radius1',
  display: 'flex',
  alignItems: 'center',
  padding: '$space1 $space6 $space1 $space6',
  position: 'relative',
  userSelect: 'none',

  '&[data-disabled]': {
    pointerEvents: 'none',
  },
  '&[data-highlighted]': {
    outline: 'none',
    backgroundColor: '$bgActionTransparentHover',
  },
})

const SelectLabel = styled(RadixSelect.Label, {
  padding: '$space6',
})

const SelectSeparator = styled(RadixSelect.Separator, {
  height: '$divider1',
  backgroundColor: '$textDefault',
  margin: '$size1',
})

const SelectItemIndicator = styled(RadixSelect.ItemIndicator, {
  position: 'absolute',
  left: 0,
  width: '$size6',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const scrollButtonCss: CSS = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '$space6',
  color: '$textActionPrimary',
  cursor: 'default',
}

const SelectScrollDownButton = styled(
  RadixSelect.ScrollDownButton,
  scrollButtonCss
)
const SelectScrollUpButton = styled(RadixSelect.ScrollUpButton, scrollButtonCss)

const SelectRoot = styled(RadixSelect.Root)

const SelectValue = styled(RadixSelect.Value)

const SelectPortal = styled(RadixSelect.Portal)

const SelectGroup = styled(RadixSelect.Group)

const SelectItemText = styled(RadixSelect.SelectItemText)

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Content: SelectContent,
  Viewport: SelectViewport,
  Group: SelectGroup,
  Label: SelectLabel,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  ScrollUpButton: SelectScrollUpButton,
  ScrollDownButton: SelectScrollDownButton,
  Separator: SelectSeparator,
}
