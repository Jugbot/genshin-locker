import { action } from '@storybook/addon-actions'
import { ComponentMeta, ComponentStoryFn } from '@storybook/react'
import React from 'react'

import { Logic, Scoring } from '../../../../automation/scoring/types'

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
    },
  ],
}

export const Uncontrolled: ComponentStoryFn<typeof LogicTree> = () => {
  const [logic, setLogic] = React.useState<Logic<Scoring>>([
    {
      type: 'popularity',
      percentile: 0.2,
    },
  ])

  return <LogicTree value={logic} onChange={setLogic} />
}
