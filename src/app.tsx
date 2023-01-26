import { ImageIcon, PlayIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Artifact } from './automation/types'
import {
  Box,
  Button,
  Heading,
  MenuBar,
  ProgressBar,
  StandardScrollArea,
  Text,
  TextArea,
} from './components'
import { ArtifactCard } from './composites'

const App: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])

  useEffect(() => {
    return window.electron.ipcRenderer.on('artifact', (artifact) => {
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
          }}
        >
          <Box css={{ flexGrow: 0, mr: '$space2' }}>
            <Heading>Heading</Heading>
            <Text>Text</Text>
          </Box>
          <StandardScrollArea css={{ flexGrow: 1, height: '100%' }}>
            <Box
              css={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: '$space3',
              }}
            >
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </Box>
          </StandardScrollArea>
        </Box>
        <Box css={{ flex: 0, flexBasis: 'content' }}>
          <Box css={{ mb: '$space2', display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={() =>
                window.electron.ipcRenderer.sendMessage('start', {
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
          <TextArea
            readOnly
            css={{ width: '100%', height: '7em' }}
            value={`Some logs
logs
logs
logs
logs
logs
logs`}
          />
        </Box>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
