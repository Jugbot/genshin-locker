import { Box, Heading, Stack, Text } from '@gl/component-library'
import { Artifact, MainStatKey, SlotKey, SubStatKey } from '@gl/types'
import {
  ArrowRightIcon,
  LockClosedIcon,
  LockOpen2Icon,
} from '@radix-ui/react-icons'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  GiIntricateNecklace,
  GiTwirlyFlower,
  GiJeweledChalice,
  GiFeather,
  GiHourglass,
} from 'react-icons/gi'

const rarityScale = (rarity: number) => {
  switch (rarity) {
    case 5:
      return 'orange'
    case 4:
      return 'purple'
    case 3:
      return 'blue'
    case 2:
      return 'green'
    default:
      return 'slate'
  }
}

const ArtifactSlotIcon = ({ slot }: { slot: SlotKey }) => {
  switch (slot) {
    case SlotKey.CIRCLET:
      return <GiIntricateNecklace />
    case SlotKey.FLOWER:
      return <GiTwirlyFlower />
    case SlotKey.GOBLET:
      return <GiJeweledChalice />
    case SlotKey.PLUME:
      return <GiFeather />
    case SlotKey.SANDS:
      return <GiHourglass />
  }
}

interface LockProps {
  closed: boolean
}
const Lock = ({ closed }: LockProps) =>
  closed ? <LockClosedIcon /> : <LockOpen2Icon />

interface LockStatusProps {
  locked: boolean
  shouldBeLocked: boolean
}

// Unlocking is red since it removes protection
const lockStatusCss = (locked: boolean, shouldBeLocked: boolean) => {
  if (locked === shouldBeLocked) {
    return { color: '$textFaint', iconColor: '$textFaint' }
  }
  const scale = shouldBeLocked ? 'green' : 'red'
  return { color: `$${scale}11`, iconColor: `$${scale}11` }
}

const LockStatus = ({ locked, shouldBeLocked }: LockStatusProps) => {
  const { t } = useTranslation()
  const willChange = locked !== shouldBeLocked
  let label = shouldBeLocked ? t('locked') : t('unlocked')
  if (willChange) {
    label = shouldBeLocked ? t('will-lock') : t('will-unlock')
  }
  const { iconColor, ...colors } = lockStatusCss(locked, shouldBeLocked)

  return (
    <Text
      color="inherit"
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$space2',
        px: '$space3',
        py: '$space2',
        borderTop: '1px solid $borderSubtle',
        fontSize: '$fontSize1',
        fontWeight: willChange ? '$bold' : '$regular',
        ...colors,
      }}
    >
      <Box
        as="span"
        css={{ display: 'inline-flex', alignItems: 'center', gap: '$space1' }}
      >
        {willChange && (
          <>
            <Box as="span" css={{ display: 'inline-flex', opacity: 0.6 }}>
              <Lock closed={locked} />
            </Box>
            <ArrowRightIcon width={12} />
          </>
        )}
        <Box as="span" css={{ display: 'inline-flex', color: iconColor }}>
          <Lock closed={shouldBeLocked} />
        </Box>
      </Box>
      {label}
    </Text>
  )
}

type StatKey = SubStatKey | MainStatKey

const useFormatStat = () => {
  const { t } = useTranslation('artifact')
  return (key: StatKey, value: number) => ({
    label: t(`stat.${key}`),
    value: key.at(-1) === '_' ? `${value}%` : `${value}`,
  })
}

const ellipsis = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const

interface HeaderProps {
  artifact: Artifact
  scale: string
}

// Only the main stat type is shown; its value matters less
const Header = ({ artifact, scale }: HeaderProps) => {
  const { t } = useTranslation('artifact')
  const format = useFormatStat()
  const setName = t(`set.${artifact.setKey}`)
  const main = format(artifact.mainStatKey, artifact.mainStatValue)

  const text = (
    <>
      <Heading
        variant="sm"
        title={setName}
        css={{ fontSize: '$fontSize2', color: `$${scale}11`, ...ellipsis }}
      >
        {setName}
      </Heading>
      <Text
        css={{
          fontSize: '$fontSize2',
          display: 'flex',
          gap: '$space2',
          alignItems: 'baseline',
          minWidth: 0,
        }}
      >
        <Box as="span" css={{ color: '$textDefault', ...ellipsis }}>
          {main.label}
        </Box>
        <Box
          as="span"
          css={{ color: '$textFaint', flexShrink: 0, fontSize: '$fontSize1' }}
        >
          Lv. {artifact.level}
        </Box>
      </Text>
    </>
  )

  return (
    <Box
      css={{
        backgroundColor: `$${scale}3`,
        borderBottom: `1px solid $${scale}6`,
        padding: '$space3',
        display: 'flex',
        alignItems: 'center',
        gap: '$space3',
      }}
    >
      <Box
        // Rarity is otherwise shown only by color
        title={`${artifact.rarity}★ ${t(`slot.${artifact.slotKey}`)}`}
        aria-label={`${artifact.rarity}★ ${t(`slot.${artifact.slotKey}`)}`}
        css={{
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          width: '$size9',
          height: '$size9',
          borderRadius: '$radius2',
          fontSize: '$fontSize5',
          color: `$${scale}11`,
          backgroundColor: `$${scale}5`,
        }}
      >
        <ArtifactSlotIcon slot={artifact.slotKey} />
      </Box>
      <Box css={{ flexGrow: 1, minWidth: 0 }}>{text}</Box>
    </Box>
  )
}

const SubstatList = ({ artifact }: { artifact: Artifact }) => {
  const format = useFormatStat()
  const substats = [
    ...artifact.substats.map((s) => ({ ...s, inactive: false })),
    ...artifact.unactivatedSubstats.map((s) => ({ ...s, inactive: true })),
  ]

  return (
    <Stack.Vertical css={{ padding: '$space3', gap: '$space1', flexGrow: 1 }}>
      {substats.map(({ key, value, inactive }) => {
        const stat = format(key, value)
        return (
          <Box
            key={key}
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '$space2',
              fontSize: '$fontSize2',
              opacity: inactive ? 0.5 : 1,
            }}
          >
            <Text as="span" color="subdued" css={{ fontSize: 'inherit' }}>
              {stat.label}
            </Text>
            <Text as="span" css={{ fontSize: 'inherit' }}>
              {stat.value}
            </Text>
          </Box>
        )
      })}
    </Stack.Vertical>
  )
}

interface ArtifactCardProps extends React.ComponentProps<typeof Box> {
  artifact: Artifact
  shouldBeLocked: boolean
}

export const ArtifactCard = ({
  artifact,
  shouldBeLocked,
  css,
  ...props
}: ArtifactCardProps) => {
  const scale = rarityScale(artifact.rarity)

  return (
    <Box
      css={{
        backgroundColor: '$bgElevated',
        border: `1px solid $${scale}7`,
        borderRadius: '$radius2',
        overflow: 'hidden',
        // Column layout keeps lock footers aligned across a grid row
        display: 'flex',
        flexDirection: 'column',
        ...css,
      }}
      {...props}
    >
      <Header artifact={artifact} scale={scale} />
      <SubstatList artifact={artifact} />
      <LockStatus locked={artifact.lock} shouldBeLocked={shouldBeLocked} />
    </Box>
  )
}
