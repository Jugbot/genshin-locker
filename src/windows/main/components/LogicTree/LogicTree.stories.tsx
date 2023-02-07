import { ComponentMeta, ComponentStoryFn } from "@storybook/react"

import { LogicTree } from "./LogicTree"

export default {
  title: 'LogicTree',
  component: LogicTree,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: {actions: 'onChange'}
  }
} as ComponentMeta<typeof LogicTree>

const Template: ComponentStoryFn<typeof LogicTree> = (args) => (
  <LogicTree {...args} />
)

export const FirstStory = Template.bind({})

FirstStory.args = {
  value: [{
    type: 'popularity',
    percentile: 0.20
  }],
  onChange: console.log
}
