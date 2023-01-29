import { CheckIcon, ImageIcon, PlayIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Channel } from './apiTypes'
import { Artifact } from './automation/types'
import {
  Box,
  Button,
  Checkbox,
  Heading,
  MenuBar,
  ProgressBar,
  ResizeHandle,
  Slider,
  StandardScrollArea,
  Text,
  TextArea,
} from './components'
import { ArtifactCard } from './composites'

export type RoutineStatus = { max: number; current: number }
type ArtifactData = { artifact: Artifact; score: number }

const App: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([])
  const [routineStatus, setRoutineStatus] = useState<
    RoutineStatus | Record<string, never>
  >({})
  const [logs, setLogs] = useState<string[]>([])

  const [bottomPanelHeight, setBottomPanelHeight] = useState(0)

  useEffect(() => {
    return window.electron.on(Channel.ARTIFACT, (artifact, score) => {
      setArtifacts((a) => [...a, { artifact, score }])
    })
  }, [])

  useEffect(() => {
    return window.electron.on(Channel.PROGRESS, (progress) => {
      console.log(progress)
      setRoutineStatus(progress)
    })
  }, [])

  useEffect(() => {
    return window.electron.on(Channel.LOG, (mode, text) => {
      console[mode](text)
      setLogs((arr) => [...arr, `[${mode.toUpperCase()}]: ${text}`])
    })
  }, [])

  const sortedArtifacts = React.useMemo(
    () => artifacts.slice().sort((a, b) => a.score - b.score),
    [artifacts]
  )

  const logString = React.useMemo(() => logs.join('\n'), [logs])

  return (
    <Box
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
        <Box
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
          <Box
            css={{
              flex: '0 0 20%',
              mr: '$space2',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '$space2',
            }}
          >
            <Text>Label</Text>
            <Box
              css={{ display: 'flex', alignItems: 'center', gap: '$space2' }}
            >
              <Slider.Root
                defaultValue={[50]}
                max={100}
                step={1}
                css={{ flexGrow: 1 }}
              >
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumb />
              </Slider.Root>
              <Heading variant="subheading">20</Heading>
            </Box>
            <Text>Label Too</Text>
            <Box
              css={{ display: 'flex', alignItems: 'center', gap: '$space2' }}
            >
              <Checkbox.Root defaultChecked>
                <Checkbox.Indicator>
                  <CheckIcon />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <Heading variant="subheading">Label</Heading>
            </Box>
          </Box>
          <StandardScrollArea css={{ flexGrow: 1, height: '100%' }}>
            <Box
              css={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
                gridAutoRows: 'min-content',
                gap: '$space3',
              }}
            >
              {sortedArtifacts.map(({ artifact, score }) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  score={score}
                  css={{
                    animation: 'fadeIn 300ms ease-out',
                  }}
                />
              ))}
            </Box>
          </StandardScrollArea>
        </Box>
        <Box
          css={{
            flex: 0,
            flexBasis: bottomPanelHeight,
            display: 'flex',
            flexDirection: 'column',
            gap: '$space2',
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
          <Box css={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={() => {
                setArtifacts([])
                window.electron.invoke(Channel.START, {
                  percentile: 0.2,
                  targetAttributes: {
                    set: true,
                    slot: true,
                    main: false,
                    sub: false,
                  },
                })
              }}
              size="small"
              css={{ mr: '$space2' }}
            >
              <PlayIcon />
            </Button>
            <ProgressBar
              value={routineStatus.current}
              max={routineStatus.max}
              css={{ flexGrow: 1, height: '$size8' }}
            />
          </Box>
          <TextArea readOnly css={{ flexGrow: 1 }} value={logString} />
        </Box>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
