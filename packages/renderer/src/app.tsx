import {
  Box,
  Button,
  ButtonIcon,
  Heading,
  MenuBar,
  Panel,
  ProgressBar,
  ScrollArea,
  Stack,
  Text,
  TextArea,
} from '@gl/component-library'
import { loadGlobalStyles, rotate } from '@gl/theme'
import { ArtifactData, Channel, RoutineStatus } from '@gl/types'
import { ExternalLinkIcon, UpdateIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { GiOpenFolder, GiPlayButton } from 'react-icons/gi'

import { version as appVersion } from '../../../package.json'

import { api } from './api'
import { ArtifactCard, StandardSelect } from './components'
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
  const [lockWhileScanning, setLockWhileScanning] = React.useState(true)
  const [logs, setLogs] = React.useState<string[]>([])
  const routineSelectOptions = {
    SCAN: t('scan'),
    SCAN_AND_LOCK: t('scan-and-lock'),
  }
  const [customScriptNames, setCustomScriptNames] = React.useState<string[]>([])
  const [selectedScript, setSelectedScript] = React.useState<string>()
  const [routineType, setRoutineType] =
    React.useState<keyof typeof routineSelectOptions>('SCAN_AND_LOCK')

  React.useEffect(() => {
    const recalculate = (scriptName?: string) =>
      api
        .invoke(
          Channel.CALCULATE,
          scriptName,
          artifacts.map(({ artifact }) => artifact)
        )
        .then((data) =>
          // Avoid overwriting new data
          setArtifactSet((last) => ({
            ...last,
            ...Object.fromEntries(
              data.map((artifactData) => [
                artifactData.artifact.id,
                artifactData,
              ])
            ),
          }))
        )
    // If a file no longer exists switch to the default
    if (selectedScript && !customScriptNames.includes(selectedScript)) {
      setSelectedScript(undefined)
    } else {
      recalculate(selectedScript)
    }
    // FIXME: Avoid artifacts update loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customScriptNames, selectedScript])

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
    return api.on(Channel.USER_SCRIPT_CHANGE, (fileNames) => {
      setCustomScriptNames(fileNames)
    })
  }, [])

  const handleOpenUserScripts = () => {
    api.invoke(Channel.OPEN_USER_SCRIPT_FOLDER)
  }

  const startRoutine = () => {
    setArtifactSet({})
    api.invoke(Channel.START, lockWhileScanning, selectedScript)
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
            fontWeight: 'bolder',
          }}
        >
          Genshin Locker{' '}
          <Box css={{ display: 'inline-block', fontWeight: 'normal' }}>
            {appVersion}
          </Box>
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
                required
                options={routineSelectOptions}
                onValueChange={(val) => {
                  setRoutineType(val)
                  setLockWhileScanning(val === 'SCAN_AND_LOCK' ? true : false)
                }}
                value={routineType}
              />
              {routineType === 'SCAN_AND_LOCK' && (
                <>
                  <StandardSelect
                    size="small"
                    options={customScriptNames}
                    onValueChange={setSelectedScript}
                    value={selectedScript}
                    placeholder={'(default)'}
                    css={{
                      textTransform: 'none',
                    }}
                  />
                  <Button
                    variant="subdued"
                    size="small"
                    onClick={handleOpenUserScripts}
                  >
                    <GiOpenFolder />
                  </Button>
                </>
              )}
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
