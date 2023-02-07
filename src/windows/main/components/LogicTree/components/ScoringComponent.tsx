import React from 'react'
import { Optional } from 'utility-types'

import { scoreTypes } from '../../../../../automation/scoring/scores'
import {
  BinaryLogic,
  BinaryOperation,
  LeafLogic,
  Logic,
  Scoring,
  UnaryLogic,
  UnaryOperation,
} from '../../../../../automation/scoring/types'
import { Stack, Heading, Text, Slider } from '../../../../../components'
import { StandardSelect } from '../../StandardSelect'
import { ControlledState } from '../../../../reactUtils'

type ScoringComponentProps = ControlledState<Scoring>

export const ScoringComponent = ({ value, onChange }: ScoringComponentProps) => {
  return (
    <Stack.Vertical>
      <Text>Scoring Method</Text>
      <StandardSelect
        value={value.type}
        options={scoreTypes}
        onValueChange={(val) =>
          onChange((old) => ({
            ...old,
            type: val,
          }))
        }
        variant="subdued"
        size="small"
        css={{ width: '100%' }}
      />
      <Text>Minimum Percentile</Text>
      <Stack.Horizontal>
        <Slider.Root
          value={[value.percentile]}
          onValueChange={([val]) =>
            onChange((old) => ({
              ...old,
              percentile: val,
            }))
          }
          max={1}
          step={0.01}
          css={{ flexGrow: 1 }}
        >
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb />
        </Slider.Root>
        <Heading variant="subheading">{value.percentile.toFixed(2)}</Heading>
      </Stack.Horizontal>
    </Stack.Vertical>
  )
}