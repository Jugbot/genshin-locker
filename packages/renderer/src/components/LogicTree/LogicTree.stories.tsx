import { ScoringLogic } from '@gl/automation'
import { action } from '@storybook/addon-actions'
import { ComponentMeta, ComponentStoryFn } from '@storybook/react'
import * as React from 'react'

import { LogicTree } from './LogicTree'

export default {
  title: 'LogicTree',
  component: LogicTree,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof LogicTree>

const Template: ComponentStoryFn<typeof LogicTree> = ({ value }) => (
  <LogicTree
    value={value}
    onChange={(next) => action('onChange')(next(value))}
  />
)

export const Controlled = Template.bind({})

Controlled.args = {
  value: [
    {
      type: 'popularity',
      percentile: 0.2,
      bucket: {
        set: false,
        slot: false,
        main: false,
        sub: false,
      },
    },
  ],
}

export const Uncontrolled: ComponentStoryFn<typeof LogicTree> = () => {
  const [logic, setLogic] = React.useState<ScoringLogic>([
    {
      type: 'popularity',
      percentile: 0.2,
      bucket: {
        set: false,
        slot: false,
        main: false,
        sub: false,
      },
    },
  ])

  return <LogicTree value={logic} onChange={setLogic} />
}
