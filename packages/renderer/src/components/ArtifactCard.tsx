import { Box, Heading, Stack, Text } from '@gl/component-library'
import { Artifact, MainStatKey, SlotKey, SubStatKey } from '@gl/types'
import {
  ArrowRightIcon,
  LockClosedIcon,
  LockOpen1Icon,
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

const rarityColors = (rarity: number) => {
  switch (rarity) {
    case 5:
      return '$orange8'
    case 4:
      return '$purple8'
    case 3:
      return '$blue8'
    case 2:
      return '$green8'
    default:
      return '$slate8'
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
const Lock = ({ closed }: LockProps) => (
  <Text css={{ color: closed ? '$red11' : '$green11' }}>
    {closed ? <LockClosedIcon /> : <LockOpen1Icon />}
  </Text>
)

interface ArtifactStatProps extends React.ComponentProps<typeof Text> {
  stat: [key: SubStatKey | MainStatKey, value: number]
}

const ArtifactStat = ({ stat: [key, value], ...props }: ArtifactStatProps) => {
  const { t } = useTranslation('artifact')

  let formattedValue = `${value}`
  if (key.at(-1) === '_') {
    formattedValue = `${value}%`
  }

  return (
    <Box css={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text {...props}>{t(`stat.${key}`)}</Text>
      <Text {...props}>{formattedValue}</Text>
    </Box>
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
  const { t } = useTranslation('artifact')

  return (
    <Box
      css={{
        backgroundColor: '$slate5',
        borderRadius: '$radius1',
        overflow: 'hidden',
        ...css,
      }}
      {...props}
    >
      <Box
        css={{
          backgroundColor: rarityColors(artifact.rarity),
          borderBottom: '2px solid $colors$textDefault',
          padding: '$space2',
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '$space2',
        }}
      >
        <Box css={{ flexGrow: 1, overflow: 'hidden' }}>
          <Heading
            variant="md"
            css={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {t(`set.${artifact.setKey}`)}
          </Heading>
        </Box>
        <Heading variant="md" css={{ flexGrow: 0, display: 'contents' }}>
          <ArtifactSlotIcon slot={artifact.slotKey} />
        </Heading>
      </Box>
      <Stack.Horizontal
        css={{
          backgroundColor: '$slate7',
          padding: '$space2',
          justifyContent: 'center',
        }}
      >
        <Lock closed={artifact.lock} />
        <Text>
          <ArrowRightIcon />
        </Text>
        <Lock closed={shouldBeLocked} />
      </Stack.Horizontal>
      <Stack.Vertical
        css={{
          padding: '$space2',
        }}
      >
        <Heading variant="sm">lvl {artifact.level}</Heading>
        <b>
          <ArtifactStat
            variant="body"
            stat={[artifact.mainStatKey, artifact.mainStatValue]}
          />
        </b>
        {artifact.substats.map((stat) => (
          <ArtifactStat key={stat.key} stat={[stat.key, stat.value]} />
        ))}
      </Stack.Vertical>
    </Box>
  )
}
