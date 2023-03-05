import { CheckIcon, ExternalLinkIcon, UpdateIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { GiPlayButton } from 'react-icons/gi'

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
  Text,
  TextArea,
  Stack,
  ButtonIcon,
} from '../../components'
import { loadGlobalStyles } from '../../globalCss'
import { rotate } from '../../stitches/keyframes'

import { api } from './api'
import { ArtifactCard, StandardSelect } from './components'
import { LogicTree } from './components/LogicTree'
import { useThemeClass } from './hooks'
import { initTranslations } from './i18n'

initTranslations()

export type RoutineStatus = { max: number; current: number }
export type ArtifactData = { artifact: Artifact; shouldBeLocked: boolean }

const App: React.FC = () => {
  loadGlobalStyles()
  const themeClass = useThemeClass()
  const { t } = useTranslation()
  const [artifactSet, setArtifactSet] = useState<Record<string, ArtifactData>>(
    {}
  )
  const artifacts = Object.values(artifactSet)
  const [routineStatus, setRoutineStatus] = useState<
    RoutineStatus | Record<string, never>
  >({})
  const [routineOptions, setRoutineOptions] = useState<RoutineOptions>({
    logic: [
      [{ type: 'popularity', percentile: 0.5 }],
      'OR',
      ['NOT', [{ type: 'rarity', percentile: 0.25 }]],
    ],
    targetAttributes: {
      set: true,
      slot: true,
      main: false,
      sub: false,
    },
    lockWhileScanning: true,
  })
  const [logs, setLogs] = useState<string[]>([])
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0)
  const routineSelectOptions = {
    SCAN: t('scan'),
    SCAN_AND_LOCK: t('scan-and-lock'),
  }
  const [routineType, setRoutineType] =
    useState<keyof typeof routineSelectOptions>('SCAN_AND_LOCK')

  useEffect(() => {
    return api.on(Channel.ARTIFACT, (artifact, shouldBeLocked) => {
      setArtifactSet((old) => ({
        ...old,
        [artifact.id]: { artifact, shouldBeLocked },
      }))
    })
  }, [])

  useEffect(() => {
    return api.on(Channel.PROGRESS, (progress) => {
      setRoutineStatus(progress)
    })
  }, [])

  useEffect(() => {
    return api.on(Channel.LOG, (mode, text) => {
      // eslint-disable-next-line no-console
      console[mode](text)
      setLogs((arr) => [...arr, `[${mode.toUpperCase()}]: ${text}`])
    })
  }, [])

  useEffect(() => {
    api
      .invoke(
        Channel.CALCULATE,
        routineOptions.logic,
        routineOptions.targetAttributes,
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
  }, [routineOptions.logic, routineOptions.targetAttributes])

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
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack.Horizontal
          css={{
            flex: 1,
            mb: '$space2',
            minHeight: 0,
            maxHeight: '100%',
            overflow: 'hidden',
            alignItems: 'stretch',
          }}
        >
          <ScrollArea.Root
            css={{
              flex: '0 0 20%',
            }}
          >
            <ScrollArea.Viewport>
              <Stack.Vertical>
                <Text>{t('comparison-buckets')}</Text>
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
                            set: t('artifact-set'),
                            slot: t('slot-type'),
                            main: t('main-stat'),
                            sub: t('substats'),
                          }[key]
                        }
                      </Heading>
                    </Stack.Horizontal>
                  )
                )}
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
          <Stack.Vertical
            css={{
              flexGrow: 1,
            }}
          >
            <Stack.Horizontal
              css={{
                backgroundColor: '$bgSecondary',
                padding: '$space2',
                borderRadius: '$radius1',
              }}
            >
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
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
          </Stack.Vertical>
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
        </Stack.Vertical>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
