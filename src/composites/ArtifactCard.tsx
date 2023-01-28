import React from 'react'
import { GiIntricateNecklace } from 'react-icons/gi'

import { Artifact, SlotKey } from '../automation/types'
import { Box, Heading, Text } from '../components'

const rarityColors = (rarity: number) => {
  switch (rarity) {
    case 5:
      return '#f22'
    case 4:
      return '#f2f'
    case 3:
      return '#3ff'
    case 2:
      return '#ff4'
  }
  return '#fff'
}

const ArtifactSlotIcon = ({ slot }: { slot: SlotKey }) => {
  switch (slot) {
    case SlotKey.CIRCLET:
      return <GiIntricateNecklace />
  }
  return <GiIntricateNecklace />
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
}

export const ArtifactCard = ({
  artifact,
  score,
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
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '$',
          padding: '$space2',
        }}
      >
        {score.toFixed(1)} persentile
      </Box>
      <Box
        css={{
          backgroundColor: rarityColors(artifact.rarity),
          borderBottom: '2px solid $colors$sand11',
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
            }}
          >
            {artifact.setKey}
          </Heading>
        </Box>
        <Heading variant="md" css={{ flexGrow: 0 }}>
          <ArtifactSlotIcon slot={artifact.slotKey} />
        </Heading>
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
