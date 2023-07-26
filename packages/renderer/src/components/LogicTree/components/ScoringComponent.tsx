import { Scores, Scoring } from '@gl/automation'
import { Stack, Heading, Text, Slider, Checkbox } from '@gl/component-library'
import { CheckIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { ControlledState } from '../../../reactUtils'
import { StandardSelect } from '../../StandardSelect'

const leafDefault = {
  rarity: {
    type: 'rarity',
    percentile: 0.5,
    bucket: {
      set: true,
      slot: true,
      main: false,
      sub: false,
    },
  },
  popularity: {
    type: 'popularity',
    percentile: 0.5,
    bucket: {
      set: true,
      slot: true,
      main: false,
      sub: false,
    },
  },
  handcrafted: {
    type: 'handcrafted',
  },
} satisfies Record<Scoring['type'], Scoring>

type ScoringComponentProps = ControlledState<Scoring>

export const ScoringComponent = ({
  value,
  onChange,
}: ScoringComponentProps) => {
  const { t } = useTranslation()

  const [cachedBranches, setCachedBranches] = React.useState({
    ...leafDefault,
    [value.type]: value,
  })

  React.useEffect(() => {
    setCachedBranches((oldCache) => ({ ...oldCache, [value.type]: value }))
  }, [value])

  const scoreSelect: Record<Scores, string> = {
    rarity: t('rarity'),
    popularity: t('popularity'),
    // handcrafted: t('handcrafted'),
  } as Record<Scores, string>

  return (
    <Stack.Vertical>
      <StandardSelect
        value={value.type}
        options={scoreSelect}
        onValueChange={(val) => onChange(() => cachedBranches[val])}
        variant="transparent"
        size="text"
      />
      <Stack.Vertical css={{ px: '$space2' }}>
        {!('bucket' in value) ? null : (
          <ComparisonBuckets
            value={value.bucket}
            onChange={(bucket) =>
              onChange((old) =>
                'bucket' in old
                  ? {
                      ...old,
                      bucket: bucket(old.bucket),
                    }
                  : old
              )
            }
          />
        )}
        {!('percentile' in value) ? null : (
          <>
            <Text>{t('minimum-percentile')}</Text>
            <Stack.Horizontal>
              <Slider.Root
                value={[value.percentile]}
                onValueChange={([val]) =>
                  onChange((old) =>
                    'percentile' in old
                      ? {
                          ...old,
                          percentile: val,
                        }
                      : old
                  )
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
              <Heading variant="subheading">
                {value.percentile.toFixed(2)}
              </Heading>
            </Stack.Horizontal>
          </>
        )}
      </Stack.Vertical>
    </Stack.Vertical>
  )
}

type Buckets<T = Scoring> = T extends { bucket: unknown } ? T['bucket'] : never

const ComparisonBuckets = ({ value, onChange }: ControlledState<Buckets>) => {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('comparison-buckets')}</Text>
      {Object.entries(value).map(([key, value]) => (
        <Stack.Horizontal key={key}>
          <Checkbox.Root
            checked={value}
            onCheckedChange={(e) =>
              onChange((options) => ({
                ...options,
                [key]: Boolean(e),
              }))
            }
          >
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <Heading variant="subheading">
            {
              {
                set: t('artifact-set'),
                slot: t('slot-type'),
                main: t('main-stat'),
                sub: t('substats'),
              }[key]
            }
          </Heading>
        </Stack.Horizontal>
      ))}
    </>
  )
}
