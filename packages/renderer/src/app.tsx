import type { RoutineOptions } from '@gl/automation'
import {
  Box,
  Button,
  Heading,
  MenuBar,
  ProgressBar,
  ScrollArea,
  Text,
  TextArea,
  Stack,
  ButtonIcon,
  Panel,
} from '@gl/component-library'
import { loadGlobalStyles, rotate } from '@gl/theme'
import { ArtifactData, RoutineStatus, Channel } from '@gl/types'
import { ExternalLinkIcon, UpdateIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { GiPlayButton } from 'react-icons/gi'

import { api } from './api'
import { ArtifactCard, StandardSelect } from './components'
import { LogicTree } from './components/LogicTree'
import { useThemeClass } from './hooks'
import { initTranslations } from './i18n'

initTranslations()

export const App: React.FC = () => {
  loadGlobalStyles()
  const themeClass = useThemeClass()
  const { t } = useTranslation()
  const [artifactSet, setArtifactSet] = React.useState<
    Record<string, ArtifactData>
  >({})
  const artifacts = Object.values(artifactSet)
  const [routineStatus, setRoutineStatus] = React.useState<
    RoutineStatus | Record<string, never>
  >({})
  const [routineOptions, setRoutineOptions] = React.useState<RoutineOptions>({
    logic: [
      [
        {
          type: 'popularity',
          percentile: 0.5,
          bucket: {
            set: true,
            slot: true,
            main: false,
            sub: false,
          },
        },
      ],
      'OR',
      [
        'NOT',
        [
          {
            type: 'rarity',
            percentile: 0.25,
            bucket: {
              set: true,
              slot: true,
              main: false,
              sub: false,
            },
          },
        ],
      ],
    ],
    lockWhileScanning: true,
  })
  const [logs, setLogs] = React.useState<string[]>([])
  const routineSelectOptions = {
    SCAN: t('scan'),
    SCAN_AND_LOCK: t('scan-and-lock'),
  }
  const [routineType, setRoutineType] =
    React.useState<keyof typeof routineSelectOptions>('SCAN_AND_LOCK')

  React.useEffect(() => {
    return api.on(Channel.ARTIFACT, (artifact, shouldBeLocked) => {
      setArtifactSet((old) => ({
        ...old,
        [artifact.id]: { artifact, shouldBeLocked },
      }))
    })
  }, [])

  React.useEffect(() => {
    return api.on(Channel.PROGRESS, (progress) => {
      setRoutineStatus(progress)
    })
  }, [])

  React.useEffect(() => {
    return api.on(Channel.LOG, (mode, text) => {
      // eslint-disable-next-line no-console
      console[mode](text)
      setLogs((arr) => [...arr, `[${mode.toUpperCase()}]: ${text}`])
    })
  }, [])

  React.useEffect(() => {
    api
      .invoke(
        Channel.CALCULATE,
        routineOptions.logic,
        artifacts.map(({ artifact }) => artifact)
      )
      .then((data) =>
        // Avoid overwriting new data
        setArtifactSet((last) => ({
          ...last,
          ...Object.fromEntries(
            data.map((artifactData) => [artifactData.artifact.id, artifactData])
          ),
        }))
      )
    // FIXME: Avoid artifacts update loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineOptions.logic])

  const startRoutine = () => {
    setArtifactSet({})
    api.invoke(Channel.START, routineOptions)
  }

  const [isSaving, setIsSaving] = React.useState(false)
  const exportFile = () => {
    setIsSaving(true)
    api
      .invoke(
        Channel.SAVE_ARTIFACTS,
        artifacts.map(({ artifact }) => artifact)
      )
      .then(() => setIsSaving(false))
  }

  const sortedArtifacts = React.useMemo(
    // TODO: Sort controls
    () => artifacts.slice().sort(),
    [artifacts]
  )
  const lockedAmount = React.useMemo(
    // TODO: Sort controls
    () => artifacts.filter((a) => a.shouldBeLocked).length,
    [artifacts]
  )
  const unlockedAmount = artifacts.length - lockedAmount

  const logString = React.useMemo(() => logs.join('\n'), [logs])

  return (
    <Box
      id="appStyled"
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
          position: 'fixed',
          left: 'env(titlebar-area-x, 0)',
          top: 'env(titlebar-area-y, 0)',
          width: 'env(titlebar-area-width)',
          height: 'env(titlebar-area-height)',
          boxSizing: 'border-box',
        }}
      >
        <Heading
          variant="subheading"
          css={{
            lineHeight: 'env(titlebar-area-height)',
            mt: '-$space2',
            fontWeight: 'bold',
          }}
        >
          Genshin Locker
        </Heading>
      </MenuBar.Root>
      <Box
        css={{
          mt: 'env(titlebar-area-height)',
          padding: '$space2',
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <Panel.Root autoSaveId="mainPanel" direction="vertical">
          <Panel.Pane
            css={{
              alignItems: 'stretch',
              overflow: 'hidden',
            }}
          >
            <Panel.Root autoSaveId="subPanel" direction="horizontal">
              <Panel.Pane defaultSize={30}>
                <ScrollArea.Root
                  css={{
                    flexGrow: 1,
                  }}
                >
                  <ScrollArea.Viewport>
                    <Stack.Vertical>
                      <LogicTree
                        value={routineOptions.logic}
                        onChange={(logic) =>
                          setRoutineOptions((prev) => ({
                            ...prev,
                            logic: logic(prev.logic),
                          }))
                        }
                      />
                    </Stack.Vertical>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical">
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Panel.Pane>
              <Panel.Handle />
              <Panel.Pane
                css={{
                  flexGrow: 1,
                  flexDirection: 'column',
                }}
              >
                <Stack.Horizontal
                  css={{
                    backgroundColor: '$bgSecondary',
                    padding: '$space2',
                    borderRadius: '$radius1',
                  }}
                >
                  <Text>Locked: {lockedAmount}</Text>
                  <Text>Unlocked: {unlockedAmount}</Text>
                  <Box css={{ flexGrow: 1 }} />
                  <ButtonIcon
                    onClick={exportFile}
                    variant="transparent"
                    size="small"
                  >
                    {isSaving ? (
                      <UpdateIcon
                        style={{
                          animation: `${rotate} 1s linear infinite`,
                        }}
                      />
                    ) : (
                      <ExternalLinkIcon />
                    )}
                  </ButtonIcon>
                </Stack.Horizontal>
                <ScrollArea.Root
                  css={{
                    flexGrow: 1,
                  }}
                >
                  <ScrollArea.Viewport>
                    <Box
                      css={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(15em, 1fr))',
                        gridAutoRows: 'min-content',
                        gap: '$space3',
                      }}
                    >
                      {sortedArtifacts.map(({ artifact, shouldBeLocked }) => (
                        <ArtifactCard
                          key={artifact.id}
                          artifact={artifact}
                          shouldBeLocked={shouldBeLocked}
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
              </Panel.Pane>
            </Panel.Root>
          </Panel.Pane>
          <Panel.Handle />
          <Panel.Pane css={{ flexDirection: 'column' }}>
            <Stack.Horizontal>
              <Button variant="subdued" onClick={startRoutine} size="small">
                <GiPlayButton />
              </Button>
              <StandardSelect
                size="small"
                options={routineSelectOptions}
                onValueChange={(val) => {
                  setRoutineType(val)
                  setRoutineOptions((options) => ({
                    ...options,
                    lockWhileScanning: val === 'SCAN_AND_LOCK' ? true : false,
                  }))
                }}
                value={routineType}
              />
              <ProgressBar
                value={routineStatus.current}
                max={routineStatus.max}
                css={{ flexGrow: 1, height: '$size8' }}
              />
            </Stack.Horizontal>
            <TextArea readOnly css={{ flexGrow: 1 }} value={logString} />
          </Panel.Pane>
        </Panel.Root>
      </Box>
    </Box>
  )
}
