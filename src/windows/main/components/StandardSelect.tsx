import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "@radix-ui/react-icons"
import { Select, Text } from "../../../components"

interface StandardSelectProps extends React.ComponentProps<typeof Select.Trigger> {
  options: string[],
  value: string,
  onValueChange: (value: string) => void
}

export const StandardSelect = ({options, onValueChange, value,...props}: StandardSelectProps) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger {...props}>
        <Text><Select.Value /></Text>
        <Text><Select.Icon asChild>
          <ChevronDownIcon/>
        </Select.Icon></Text>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.ScrollUpButton >
            <ChevronUpIcon/>
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map(option => (
              <Select.Item key={option} value={option}>
                <Select.ItemText asChild>
                  <Text>{option}</Text>
                </Select.ItemText>
                <Select.ItemIndicator asChild>
                  <Text>
                    <CheckIcon/>
                  </Text>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton >
            <ChevronDownIcon/>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>)
}