import { ImageIcon, PlayIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Channel } from './apiTypes'
import { Artifact } from './automation/types'
import {
  Box,
  Button,
  Heading,
  MenuBar,
  ProgressBar,
  ResizeHandle,
  StandardScrollArea,
  Text,
  TextArea,
} from './components'
import { ArtifactCard } from './composites'

const App: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0)

  useEffect(() => {
    return window.electron.on(Channel.ARTIFACT, (artifact) => {
      console.log('on artifact', artifact)
      setArtifacts((a) => [...a, artifact as Artifact])
    })
  }, [])

  return (
    <Box
      css={{
        backgroundColor: '$appBackground',
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
          <Box css={{ flex: '0 0 content', mr: '$space2', overflow: 'hidden' }}>
            <Heading>Heading</Heading>
            <Text>Text</Text>
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
              {artifacts.map((artifact) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
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
              onClick={() =>
                window.electron.invoke(Channel.START, {
                  percentile: 0.2,
                  targetAttributes: {
                    set: true,
                    slot: true,
                    main: false,
                    sub: false,
                  },
                })
              }
              size="small"
              css={{ mr: '$space2' }}
            >
              <PlayIcon />
            </Button>
            <ProgressBar
              value={65}
              max={70}
              css={{ flexGrow: 1, height: '$size8' }}
            />
          </Box>
          <TextArea readOnly css={{ flexGrow: 1 }} value={`\n\n\n\n\n\n\n\n`} />
        </Box>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
