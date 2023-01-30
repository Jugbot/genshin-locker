import React from 'react'
import {
  GiIntricateNecklace,
  GiTwirlyFlower,
  GiJeweledChalice,
  GiFeather,
  GiHourglass,
} from 'react-icons/gi'

import { Artifact, SlotKey } from '../../../automation/types'
import { Box, Heading, Text } from '../../../components'

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

interface ArtifactStatProps extends React.ComponentProps<typeof Text> {
  stat: [key: React.ReactNode, value: React.ReactNode]
}

const ArtifactStat = ({ stat: [key, value], ...props }: ArtifactStatProps) => {
  return (
    <Box css={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text {...props}>{key}</Text>
      <Text {...props}>{value}</Text>
    </Box>
  )
}

interface ArtifactCardProps extends React.ComponentProps<typeof Box> {
  artifact: Artifact
  score: number
  targetScore: number
}

export const ArtifactCard = ({
  artifact,
  score,
  targetScore,
  css,
  ...props
}: ArtifactCardProps) => {
  return (
    <Box
      css={{
        backgroundColor: '$sand5',
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
          mb: '$space1',
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
              color: '$textDefaultA',
            }}
          >
            {artifact.setKey}
          </Heading>
        </Box>
        <Heading
          variant="md"
          css={{ flexGrow: 0, display: 'contents', color: '$textDefaultA' }}
        >
          <ArtifactSlotIcon slot={artifact.slotKey} />
        </Heading>
      </Box>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '$sand4',
          padding: '$space2',
          justifyContent: 'space-around',
        }}
      >
        <Heading variant="subheading">score: {score.toFixed(1)}</Heading>
        <Heading variant="subheading">target: {targetScore.toFixed(1)}</Heading>
      </Box>
      <Box
        css={{
          padding: '$space2',
          display: 'flex',
          flexDirection: 'column',
          gap: '$space1',
        }}
      >
        <Heading variant="sm">lvl{artifact.level}</Heading>
        <b>
          <ArtifactStat
            variant="body"
            stat={[artifact.mainStatKey, artifact.mainStatValue]}
          />
        </b>
        {artifact.substats.map((stat) => (
          <ArtifactStat key={stat.key} stat={[stat.key, stat.value]} />
        ))}
      </Box>
    </Box>
  )
}
