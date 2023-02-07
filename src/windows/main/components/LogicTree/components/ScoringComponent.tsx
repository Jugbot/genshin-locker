import React from 'react'

import { scoreTypes } from '../../../../../automation/scoring/scores'
import { Scoring } from '../../../../../automation/scoring/types'
import { Stack, Heading, Text, Slider } from '../../../../../components'
import { ControlledState } from '../../../../reactUtils'
import { StandardSelect } from '../../StandardSelect'

type ScoringComponentProps = ControlledState<Scoring>

export const ScoringComponent = ({
  value,
  onChange,
}: ScoringComponentProps) => {
  return (
    <Stack.Vertical>
      <StandardSelect
        value={value.type}
        options={scoreTypes}
        onValueChange={(val) =>
          onChange((old) => ({
            ...old,
            type: val,
          }))
        }
        variant="transparent"
        size="text"
      />
      <Text css={{ px: '$space2' }}>Minimum Percentile</Text>
      <Stack.Horizontal css={{ px: '$space2' }}>
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
