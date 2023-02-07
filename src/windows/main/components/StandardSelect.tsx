import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import React from 'react'

import { Select, Text } from '../../../components'

interface StandardSelectProps<T>
  extends React.ComponentProps<typeof Select.Trigger> {
  options: readonly T[]
  value?: string
  placeholder?: string
  onValueChange: (value: T) => void
}

export const StandardSelect = <T extends string>({
  options,
  onValueChange,
  value,
  placeholder,
  ...props
}: StandardSelectProps<T>) => {
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    // Parent element is only available after first render
    setPortalRoot(document.querySelector<HTMLElement>('#appStyled'))
  }, [])

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger {...props}>
        <Select.Value asChild>
          <Text color="inherit">{value ?? placeholder ?? '(none)'}</Text>
        </Select.Value>
        <Text color="inherit">
          <Select.Icon asChild>
            <ChevronDownIcon />
          </Select.Icon>
        </Text>
      </Select.Trigger>
      <Select.Portal container={portalRoot}>
        <Select.Content>
          <Select.ScrollUpButton>
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item key={option} value={option}>
                <Select.ItemText asChild>
                  <Text>{option}</Text>
                </Select.ItemText>
                <Select.ItemIndicator asChild>
                  <Text>
                    <CheckIcon />
                  </Text>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton>
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
