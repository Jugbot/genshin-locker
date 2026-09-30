import {
  Box,
  Button,
  Heading,
  MenuBar,
  Panel,
  ProgressBar,
  ScrollArea,
  Stack,
  Text,
  TextArea,
} from '@gl/component-library'
import { CSS, loadGlobalStyles, rotate } from '@gl/theme'
import { ArtifactData, Channel, RoutineStatus } from '@gl/types'
import {
  DownloadIcon,
  LockClosedIcon,
  LockOpen2Icon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { GiJeweledChalice, GiOpenFolder, GiPlayButton } from 'react-icons/gi'

import { version as appVersion } from '../../../package.json'

import { api } from './api'
import { ArtifactCard, StandardSelect } from './components'
import { useThemeClass } from './hooks'
import { initTranslations } from './i18n'

initTranslations()

// Used when there's no title bar overlay, e.g. in a browser
const TITLEBAR_FALLBACK_HEIGHT = '32px'

// Keeps the lock state from the first scan, to tell which locks the routine
// changed
type TrackedArtifact = ArtifactData & { scannedLock: boolean }

const track = (
  data: ArtifactData,
  previous?: TrackedArtifact
): TrackedArtifact => ({
  ...data,
  scannedLock: previous?.scannedLock ?? data.artifact.lock,
})

interface StatProps {
  label: string
  value: number
  // Changes not applied yet
  pending?: { value: number; color: string; description: string }
  children: React.ReactNode
}

const Stat = ({ label, value, pending, children }: StatProps) => (
  <Text
    color="subdued"
    css={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '$space1',
      fontSize: '$fontSize2',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
    <Box as="span" css={{ color: '$textDefault', fontWeight: '$bold' }}>
      {value}
    </Box>
    {!!pending?.value && (
      <Box
        as="span"
        title={`${pending.value} ${pending.description}`}
        css={{ color: pending.color }}
      >
        (
        <Box as="span" css={{ fontWeight: '$bold' }}>
          +{pending.value}
        </Box>
        )
      </Box>
    )}
    {label}
  </Text>
)

interface StatGroupProps {
  label: string
  description: string
  css?: CSS
  children: React.ReactNode
}

const StatGroup = ({ label, description, css, children }: StatGroupProps) => (
  <Stack.Horizontal
    title={description}
    css={{
      gap: '$space3',
      pl: '$space4',
      borderLeft: '1px solid $borderDefault',
      ...css,
    }}
  >
    <Text
      as="span"
      css={{
        color: '$textFaint',
        fontSize: '$fontSize1',
        textTransform: 'uppercase',
        letterSpacing: '$letterSpacing2',
      }}
    >
      {label}
    </Text>
    {children}
  </Stack.Horizontal>
)

export const App: React.FC = () => {
  loadGlobalStyles()
  const themeClass = useThemeClass()
  const { t } = useTranslation()
  const [artifactSet, setArtifactSet] = React.useState<
    Record<string, TrackedArtifact>
  >({})
  const artifacts = Object.values(artifactSet)
  const [routineStatus, setRoutineStatus] = React.useState<
    RoutineStatus | Record<string, never>
  >({})
  const [lockWhileScanning, setLockWhileScanning] = React.useState(true)
  const minRaritySelectOptions = {
    '1': 'Rarity ≥ 1',
    '2': 'Rarity ≥ 2',
    '3': 'Rarity ≥ 3',
    '4': 'Rarity ≥ 4',
    '5': 'Rarity = 5',
  }
  const [minRarity, setMinRarity] =
    React.useState<keyof typeof minRaritySelectOptions>('5')
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
                track(artifactData, last[artifactData.artifact.id]),
              ])
            ),
          }))
        )
    if (routineType === 'SCAN') {
      // Scan Only never runs the script, so clear pending changes from an
      // earlier locking run
      setArtifactSet((last) =>
        Object.fromEntries(
          Object.entries(last).map(([id, data]) => [
            id,
            { ...data, shouldBeLocked: data.artifact.lock },
          ])
        )
      )
      return
    }
    // If a file no longer exists switch to the default
    if (selectedScript && !customScriptNames.includes(selectedScript)) {
      setSelectedScript(undefined)
    } else {
      recalculate(selectedScript)
    }
    // FIXME: Avoid artifacts update loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customScriptNames, selectedScript, routineType])

  React.useEffect(() => {
    return api.on(Channel.ARTIFACT, (artifact, shouldBeLocked) => {
      setArtifactSet((old) => ({
        ...old,
        [artifact.id]: track({ artifact, shouldBeLocked }, old[artifact.id]),
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
    const unsubscribe = api.on(Channel.USER_SCRIPT_CHANGE, (fileNames) => {
      setCustomScriptNames(fileNames)
    })
    // The list may have been pushed before this listener existed
    api.invoke(Channel.GET_USER_SCRIPTS).then(setCustomScriptNames)
    return unsubscribe
  }, [])

  const handleOpenUserScripts = () => {
    api.invoke(Channel.OPEN_USER_SCRIPT_FOLDER)
  }

  const startRoutine = () => {
    setLogs([])
    setArtifactSet({})
    setRoutineStatus({})
    api.invoke(
      Channel.START,
      lockWhileScanning,
      Number(minRarity),
      selectedScript
    )
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
  const lockCounts = React.useMemo(() => {
    const count = (predicate: (a: TrackedArtifact) => boolean) =>
      artifacts.filter(predicate).length
    return {
      locked: count((a) => a.artifact.lock),
      unlocked: count((a) => !a.artifact.lock),
      toLock: count((a) => !a.artifact.lock && a.shouldBeLocked),
      toUnlock: count((a) => a.artifact.lock && !a.shouldBeLocked),
      lockedByRoutine: count((a) => !a.scannedLock && a.artifact.lock),
      unlockedByRoutine: count((a) => a.scannedLock && !a.artifact.lock),
    }
  }, [artifacts])

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
          width: 'env(titlebar-area-width, 100%)',
          height: `env(titlebar-area-height, ${TITLEBAR_FALLBACK_HEIGHT})`,
          boxSizing: 'border-box',
        }}
      >
        <Heading
          variant="subheading"
          css={{
            color: 'inherit',
            fontWeight: 'bolder',
            display: 'flex',
            alignItems: 'baseline',
            gap: '$space2',
          }}
        >
          Genshin Locker
          <Box as="span" css={{ fontWeight: 'normal', opacity: 0.6 }}>
            v{appVersion}
          </Box>
        </Heading>
      </MenuBar.Root>
      <Box
        css={{
          mt: `env(titlebar-area-height, ${TITLEBAR_FALLBACK_HEIGHT})`,
          padding: '$space2',
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <Panel.Root autoSaveId="mainPanel" direction="vertical">
          <Panel.Pane
            defaultSize={70}
            css={{
              alignItems: 'stretch',
              overflow: 'hidden',
              // The nested pane provides the focus ring padding
              padding: 0,
            }}
          >
            <Panel.Root autoSaveId="subPanel" direction="horizontal">
              <Panel.Pane
                css={{
                  flexGrow: 1,
                  flexDirection: 'column',
                }}
              >
                <Stack.Horizontal css={{ gap: '$space4', px: '$space1' }}>
                  <Heading variant="sm">{t('artifacts')}</Heading>
                  <Stat
                    label={t('stat-locked')}
                    value={lockCounts.locked}
                    pending={{
                      value: lockCounts.toLock,
                      color: '$green11',
                      description: t('stat-to-lock'),
                    }}
                  >
                    <LockClosedIcon />
                  </Stat>
                  <Stat
                    label={t('stat-unlocked')}
                    value={lockCounts.unlocked}
                    pending={{
                      value: lockCounts.toUnlock,
                      color: '$red11',
                      description: t('stat-to-unlock'),
                    }}
                  >
                    <LockOpen2Icon />
                  </Stat>
                  <Box css={{ flexGrow: 1 }} />
                  <Button
                    onClick={exportFile}
                    variant="subdued"
                    size="small"
                    disabled={isSaving || artifacts.length === 0}
                  >
                    {isSaving ? (
                      <UpdateIcon
                        style={{
                          animation: `${rotate} 1s linear infinite`,
                        }}
                      />
                    ) : (
                      <DownloadIcon />
                    )}
                    {t('export')}
                  </Button>
                </Stack.Horizontal>
                <ScrollArea.Root
                  css={{
                    flexGrow: 1,
                    position: 'relative',
                  }}
                >
                  <ScrollArea.Viewport>
                    {sortedArtifacts.length === 0 ? (
                      <Stack.Vertical
                        css={{
                          position: 'absolute',
                          inset: 0,
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '$space1',
                          textAlign: 'center',
                        }}
                      >
                        <Text css={{ fontSize: '$fontSize7' }} color="subdued">
                          <GiJeweledChalice />
                        </Text>
                        <Text css={{ fontWeight: '$bold' }}>
                          {t('no-artifacts')}
                        </Text>
                        <Text color="subdued" css={{ fontSize: '$fontSize2' }}>
                          {t('no-artifacts-hint')}
                        </Text>
                      </Stack.Vertical>
                    ) : (
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
                    )}
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical">
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Panel.Pane>
            </Panel.Root>
          </Panel.Pane>
          <Panel.Handle />
          <Panel.Pane defaultSize={30} css={{ flexDirection: 'column' }}>
            <Stack.Horizontal>
              <Button variant="primary" onClick={startRoutine} size="small">
                <GiPlayButton />
                {t('start')}
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
              <StandardSelect
                size="small"
                required
                options={minRaritySelectOptions}
                onValueChange={setMinRarity}
                value={minRarity}
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
                css={{ flexGrow: 1, ml: '$space2' }}
              />
              {routineType === 'SCAN_AND_LOCK' && (
                <StatGroup
                  label={t('lock-changed')}
                  description={t('lock-changed-description')}
                  css={{
                    flexShrink: 0,
                    ml: '$space3',
                    height: '$size8',
                    boxSizing: 'border-box',
                    px: '$space3',
                    border: '1px solid $borderSubtle',
                    borderRadius: '$radius1',
                  }}
                >
                  <Stat
                    label={t('stat-locked')}
                    value={lockCounts.lockedByRoutine}
                  >
                    <LockClosedIcon />
                  </Stat>
                  <Stat
                    label={t('stat-unlocked')}
                    value={lockCounts.unlockedByRoutine}
                  >
                    <LockOpen2Icon />
                  </Stat>
                </StatGroup>
              )}
            </Stack.Horizontal>
            <TextArea
              readOnly
              css={{ flexGrow: 1 }}
              value={logString}
              placeholder={t('log-placeholder')}
            />
          </Panel.Pane>
        </Panel.Root>
      </Box>
    </Box>
  )
}
