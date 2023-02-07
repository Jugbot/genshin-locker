import React from 'react'

import {
  BinaryLogic,
  LeafLogic,
  Logic,
  Scoring,
  UnaryLogic,
} from '../../../../automation/scoring/types'
import { Stack, Text } from '../../../../components'
import { StandardSelect } from '../StandardSelect'

import { ScoringComponent } from './components/ScoringComponent'
import { ControlledState } from '../../../reactUtils'


const leafDefault: LeafLogic<Scoring> = [
  {
    type: 'rarity',
    percentile: 0.5,
  },
]
const unaryDefault: UnaryLogic<Scoring> = [
  'NOT',
  [
    {
      type: 'rarity',
      percentile: 0.5,
    },
  ],
]
const binaryDefault: BinaryLogic<Scoring> = [
  [
    {
      type: 'popularity',
      percentile: 0.5,
    },
  ],
  'AND',
  [
    {
      type: 'rarity',
      percentile: 0.5,
    },
  ],
]

type LogicTreeProps = ControlledState<Logic<Scoring>>

export const LogicTree = ({ value, onChange }: LogicTreeProps) => {
  const [valueCache, setValueCache] = React.useState<
    [LeafLogic<Scoring>, UnaryLogic<Scoring>, BinaryLogic<Scoring>]
  >([leafDefault, unaryDefault, binaryDefault])

  enum BranchType {
    LEAF = 1,
    UNARY = 2,
    BINARY = 3,
  }

  const operationOptions = ['Value', 'Unary Operation', 'Binary Operation']

  React.useEffect(() => {
    setValueCache((val) => [
      value.length === 1 ? value : val[0],
      value.length === 2 ? value : val[1],
      value.length === 3 ? value : val[2],
    ])
  }, [value])

  return (
    <Stack.Vertical>
      <Text>Operation</Text>
      <StandardSelect
        value={operationOptions[value.length - 1]}
        options={operationOptions}
        onValueChange={(val: string) => {
          const index = operationOptions.findIndex((other) => other === val)
          onChange(() => valueCache[index])
        }}
        variant="subdued"
        size="small"
        css={{ width: '100%' }}
      />
      {(() => {
        switch (value.length) {
          case BranchType.LEAF: {
            const [score] = value
            return (
              <ScoringComponent
                value={score}
                onChange={(next) =>
                  onChange((old) => {
                    if (old.length === 1) {
                      const [oldScore] = old
                      return [next(oldScore)]
                    }
                    return old
                  })
                }
              />
            )
          }
          case BranchType.UNARY: {
            const [operation, subtree] = value
            return (
              <>
                {operation}
                <LogicTree
                  value={subtree}
                  onChange={(next) =>
                    onChange((old) => {
                      if (old.length === 2) {
                        const [oldOperation, oldSubtree] = old
                        return [oldOperation, next(oldSubtree)]
                      }
                      return old
                    })
                  }
                />
              </>
            )
          }
          case BranchType.BINARY: {
            const [subtreeA, operation, subtreeB] = value
            return (
              <>
                <LogicTree
                  value={subtreeA}
                  onChange={(next) =>
                    onChange((old) => {
                      if (old.length === 3) {
                        const [oldSubtreeA, oldOperation, oldSubtreeB] = old
                        return [
                          next(oldSubtreeA),
                          oldOperation,
                          oldSubtreeB,
                        ]
                      }
                      return old
                    })
                  }
                />
                {operation}
                <LogicTree
                  value={subtreeB}
                  onChange={(next) =>
                    onChange((old) => {
                      if (old.length === 3) {
                        const [oldSubtreeA, oldOperation, oldSubtreeB] = old
                        return [
                          oldSubtreeA,
                          oldOperation,
                          next(oldSubtreeB),
                        ]
                      }
                      return old
                    })
                  }
                />
              </>
            )
          }
        }
      })()}
    </Stack.Vertical>
  )
}
