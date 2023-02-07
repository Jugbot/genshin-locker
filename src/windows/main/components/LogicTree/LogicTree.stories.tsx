import { ComponentMeta, ComponentStoryFn } from '@storybook/react'
import React from 'react'

import { LogicTree } from './LogicTree'

export default {
  title: 'LogicTree',
  component: LogicTree,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
} as ComponentMeta<typeof LogicTree>

const Template: ComponentStoryFn<typeof LogicTree> = (props) => (
  <LogicTree {...props} />
)

export const FirstStory = Template.bind({})

FirstStory.args = {
  value: [
    {
      type: 'popularity',
      percentile: 0.2,
    },
  ],
}
