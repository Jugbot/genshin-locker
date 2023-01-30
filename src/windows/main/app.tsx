import { CheckIcon, ImageIcon, PlayIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Channel } from '../../apiTypes'
import { RoutineOptions } from '../../automation/routines'
import { Artifact } from '../../automation/types'
import {
  Box,
  Button,
  Checkbox,
  Heading,
  MenuBar,
  ProgressBar,
  ResizeHandle,
  ScrollArea,
  Slider,
  Text,
  TextArea,
  Stack,
} from '../../components'
import { loadGlobalStyles } from '../../globalCss'

import { api } from './api'
import { ArtifactCard } from './components'
import { useThemeClass } from './hooks'

export type RoutineStatus = { max: number; current: number }
type ArtifactData = { artifact: Artifact; score: number; targetScore: number }

const App: React.FC = () => {
  loadGlobalStyles()
  const themeClass = useThemeClass()
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([])
  const [routineStatus, setRoutineStatus] = useState<
    RoutineStatus | Record<string, never>
  >({})
  const [routineOptions, setRoutineOptions] = useState<RoutineOptions>({
    percentile: 0.2,
    targetAttributes: {
      set: true,
      slot: true,
      main: false,
      sub: false,
    },
  })
  const [logs, setLogs] = useState<string[]>([])

  const [bottomPanelHeight, setBottomPanelHeight] = useState(0)

  useEffect(() => {
    return api.on(Channel.ARTIFACT, (artifact, score, targetScore) => {
      setArtifacts((a) => [...a, { artifact, score, targetScore }])
    })
  }, [])

  useEffect(() => {
    return api.on(Channel.PROGRESS, (progress) => {
      setRoutineStatus(progress)
    })
  }, [])

  useEffect(() => {
    return api.on(Channel.LOG, (mode, text) => {
      console[mode](text)
      setLogs((arr) => [...arr, `[${mode.toUpperCase()}]: ${text}`])
    })
  }, [])

  const startRoutine = () => {
    setArtifacts([])
    api.invoke(Channel.START, routineOptions)
  }

  const sortedArtifacts = React.useMemo(
    () => artifacts.slice().sort((a, b) => a.score - b.score),
    [artifacts]
  )

  const logString = React.useMemo(() => logs.join('\n'), [logs])

  return (
    <Box
      className={themeClass}
      css={{
        backgroundColor: '$bgPrimary',
        position: 'fixed',
        inset: 0,
        color: '$textDefault',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MenuBar.Root
        css={{
          width: 'env(titlebar-area-width)',
          height: 'env(titlebar-area-height)',
          boxSizing: 'border-box',
        }}
      >
        <ImageIcon />
      </MenuBar.Root>
      <Box
        css={{
          padding: '$space2',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack.Horizontal
          css={{
            flex: 1,
            display: 'flex',
            mb: '$space2',
            position: 'relative',
            minHeight: 0,
            maxHeight: '100%',
            overflow: 'hidden',
          }}
        >
          <Stack.Vertical
            css={{
              flex: '0 0 20%',
              overflowX: 'hidden',
              overflowY: 'auto',
              height: '100%',
            }}
          >
            <Text>Minimum Percentile</Text>
            <Stack.Horizontal>
              <Slider.Root
                value={[routineOptions.percentile]}
                onValueChange={(e) =>
                  setRoutineOptions((options) => ({
                    ...options,
                    percentile: e[0],
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
              <Heading variant="subheading">
                {routineOptions.percentile.toFixed(2)}
              </Heading>
            </Stack.Horizontal>
            <Text>Comparison Buckets</Text>
            {Object.entries(routineOptions.targetAttributes).map(
              ([key, value]) => (
                <Stack.Horizontal key={key}>
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) =>
                      setRoutineOptions((options) => ({
                        ...options,
                        targetAttributes: {
                          ...options.targetAttributes,
                          [key]: Boolean(e),
                        },
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
                        set: 'Artifact Set',
                        slot: 'Slot Type',
                        main: 'Main Stat',
                        sub: 'Substats',
                      }[key]
                    }
                  </Heading>
                </Stack.Horizontal>
              )
            )}
          </Stack.Vertical>
          <ScrollArea.Root
            css={{
              flexGrow: 1,
              height: '100%',
            }}
          >
            <ScrollArea.Viewport>
              <Box
                css={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
                  gridAutoRows: 'min-content',
                  gap: '$space3',
                }}
              >
                {sortedArtifacts.map(({ artifact, score, targetScore }) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    score={score}
                    targetScore={targetScore}
                    css={{
                      animation: '$fadeIn',
                    }}
                  />
                ))}
              </Box>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Stack.Horizontal>
        <Stack.Vertical
          css={{
            flex: 0,
            flexBasis: bottomPanelHeight,
          }}
        >
          <ResizeHandle
            onHandleDrag={(delta) =>
              setBottomPanelHeight((n) =>
                Math.min(document.body.scrollHeight, Math.max(0, n - delta))
              )
            }
            orientation="horizontal"
          />
          <Stack.Horizontal>
            <Button onClick={startRoutine} size="small" css={{ mr: '$space2' }}>
              <PlayIcon />
            </Button>
            <ProgressBar
              value={routineStatus.current}
              max={routineStatus.max}
              css={{ flexGrow: 1, height: '$size8' }}
            />
          </Stack.Horizontal>
          <TextArea readOnly css={{ flexGrow: 1 }} value={logString} />
        </Stack.Vertical>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
