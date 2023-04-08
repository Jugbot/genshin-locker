import { Select, Text } from '@gl/component-library'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import * as React from 'react'


interface StandardSelectProps<T extends string>
  extends React.ComponentProps<typeof Select.Trigger> {
  options: ReadonlyArray<T> | Record<T, string>
  value?: T
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

  let selectOptions: Array<[key: string, label: string]> = []
  if (Array.isArray(options)) {
    selectOptions = options.map((key) => [key, key])
  } else {
    selectOptions = Object.entries(options)
  }

  let displayValue: string | undefined = value
  if (!(options instanceof Array) && value !== undefined) {
    displayValue = options[value]
  }

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger {...props}>
        <Select.Value asChild>
          <Text color="inherit">{displayValue ?? placeholder ?? '(none)'}</Text>
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
            {selectOptions.map(([key, label]) => (
              <Select.Item key={key} value={key}>
                <Select.ItemText asChild>
                  <Text>{label}</Text>
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
