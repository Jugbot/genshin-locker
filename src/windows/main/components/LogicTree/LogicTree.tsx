import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  BinaryLogic,
  LeafLogic,
  ScoringLogic,
  Scoring,
  UnaryLogic,
  UnaryOperation,
  BinaryOperation,
} from '../../../../automation/scoring/types'
import { Box, Stack } from '../../../../components'
import { ControlledState } from '../../../reactUtils'
import { StandardSelect } from '../StandardSelect'

import { ScoringComponent } from './components/ScoringComponent'

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

interface LogicTreeProps extends ControlledState<ScoringLogic> {
  depth?: number
}

export const LogicTree = ({ value, onChange, depth = 0 }: LogicTreeProps) => {
  const { t } = useTranslation()
  const [valueCache, setValueCache] = React.useState<
    [LeafLogic<Scoring>, UnaryLogic<Scoring>, BinaryLogic<Scoring>]
  >([leafDefault, unaryDefault, binaryDefault])

  enum BranchType {
    LEAF = 1,
    UNARY = 2,
    BINARY = 3,
  }

  const branchOptions = [
    t('score-threshold'),
    t('unary-operation'),
    t('binary-operation'),
  ]

  const unaryOptions: Record<UnaryOperation, string> = {
    NOT: t('not'),
  }

  const binaryOptions: Record<BinaryOperation, string> = {
    AND: t('and'),
    OR: t('or'),
  }

  React.useEffect(() => {
    setValueCache((val) => [
      value.length === 1 ? value : val[0],
      value.length === 2 ? value : val[1],
      value.length === 3 ? value : val[2],
    ])
  }, [value])

  const rainbow = [
    '$red8',
    '$orange8',
    '$yellow8',
    '$green8',
    '$blue8',
    '$purple8',
  ] as const

  const currentColor = rainbow[depth % rainbow.length]

  return (
    <BranchWrapper color={currentColor}>
      <Stack.Vertical>
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            borderTopRightRadius: '$radius1',
            borderBottomRightRadius: '$radius1',
            backgroundColor: currentColor,
          }}
        >
          <StandardSelect
            value={branchOptions[value.length - 1]}
            options={branchOptions}
            onValueChange={(val: string) => {
              const index = branchOptions.findIndex((other) => other === val)
              onChange(() => valueCache[index])
            }}
            variant="transparent"
            size="text"
            css={{
              borderTopRightRadius: '$radius1',
              borderBottomRightRadius: '$radius1',
            }}
          />
        </Box>
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
                  <StandardSelect
                    value={operation}
                    options={unaryOptions}
                    onValueChange={(val) =>
                      onChange((old) => {
                        if (old.length === 2) {
                          const [_, oldSubtreeB] = old
                          return [val, oldSubtreeB]
                        }
                        return old
                      })
                    }
                    variant="transparent"
                    size="text"
                  />
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
                    depth={depth + 1}
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
                          return [next(oldSubtreeA), oldOperation, oldSubtreeB]
                        }
                        return old
                      })
                    }
                    depth={depth + 1}
                  />
                  <StandardSelect
                    value={operation}
                    options={binaryOptions}
                    onValueChange={(val) =>
                      onChange((old) => {
                        if (old.length === 3) {
                          const [oldSubtreeA, _, oldSubtreeB] = old
                          return [oldSubtreeA, val, oldSubtreeB]
                        }
                        return old
                      })
                    }
                    variant="transparent"
                    size="text"
                  />
                  <LogicTree
                    value={subtreeB}
                    onChange={(next) =>
                      onChange((old) => {
                        if (old.length === 3) {
                          const [oldSubtreeA, oldOperation, oldSubtreeB] = old
                          return [oldSubtreeA, oldOperation, next(oldSubtreeB)]
                        }
                        return old
                      })
                    }
                    depth={depth + 1}
                  />
                </>
              )
            }
          }
        })()}
      </Stack.Vertical>
    </BranchWrapper>
  )
}

type BranchWrapperProps = React.ComponentProps<typeof Stack.Vertical> & {
  color: string
}

const BranchWrapper = ({
  color,
  children,
  css,
  ...props
}: BranchWrapperProps) => {
  return (
    <Stack.Vertical
      {...props}
      css={{
        position: 'relative',
        marginLeft: '$space2',
        '&:after': {
          content: '',
          position: 'absolute',
          right: '100%',
          backgroundColor: color,
          width: '$size2',
          height: '100%',
          borderRadius: '$radiusMax',
          borderTopRightRadius: 0,
        },
        ...css,
      }}
    >
      {children}
    </Stack.Vertical>
  )
}
