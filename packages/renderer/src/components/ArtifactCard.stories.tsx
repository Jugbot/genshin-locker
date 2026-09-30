import { Box } from '@gl/component-library'
import { Artifact, MainStatKey, SetKey, SlotKey, SubStatKey } from '@gl/types'
import { ComponentMeta, ComponentStoryFn } from '@storybook/react'

import { ArtifactCard } from './ArtifactCard'

export default {
  title: 'ArtifactCard',
  component: ArtifactCard,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof ArtifactCard>

const Template: ComponentStoryFn<typeof ArtifactCard> = (args) => (
  <ArtifactCard {...args} css={{ minWidth: '15em' }} />
)

export const FirstStory = Template.bind({})

FirstStory.args = {
  artifact: {
    mainStatValue: 70,
    setKey: SetKey.Adventurer,
    slotKey: SlotKey.FLOWER,
    rarity: 5,
    mainStatKey: MainStatKey.ANEMO_DMG,
    level: 20,
    substats: [{ key: SubStatKey.ATK_FLAT, value: 10 }],
    unactivatedSubstats: [],
    location: 0,
    lock: false,
    id: '',
  },
  shouldBeLocked: false,
}

export const Unactivated = Template.bind({})

Unactivated.args = {
  artifact: {
    mainStatValue: 47,
    setKey: SetKey.ObsidianCodex,
    slotKey: SlotKey.PLUME,
    rarity: 5,
    mainStatKey: MainStatKey.ATK_FLAT,
    level: 0,
    substats: [
      { key: SubStatKey.DEF_FLAT, value: 16 },
      { key: SubStatKey.ENERGY_RECHARGE, value: 5.2 },
      { key: SubStatKey.ATK_PERCENT, value: 4.1 },
    ],
    unactivatedSubstats: [{ key: SubStatKey.CRIT_RATE, value: 3.9 }],
    location: 0,
    lock: true,
    id: '',
  },
  shouldBeLocked: true,
}

const sampleArtifacts: Array<{ artifact: Artifact; shouldBeLocked: boolean }> =
  [
    {
      artifact: {
        id: 'gladiator',
        setKey: SetKey.GladiatorsFinale,
        slotKey: SlotKey.FLOWER,
        rarity: 5,
        level: 20,
        mainStatKey: MainStatKey.HP_FLAT,
        mainStatValue: 4780,
        substats: [
          { key: SubStatKey.CRIT_RATE, value: 3.1 },
          { key: SubStatKey.CRIT_DAMAGE, value: 14.8 },
          { key: SubStatKey.ATK_PERCENT, value: 6.5 },
          { key: SubStatKey.ENERGY_RECHARGE, value: 8.2 },
        ],
        unactivatedSubstats: [],
        location: 0,
        lock: true,
      },
      shouldBeLocked: true,
    },
    {
      artifact: {
        id: 'noblesse',
        setKey: SetKey.NoblesseOblige,
        slotKey: SlotKey.GOBLET,
        rarity: 4,
        level: 12,
        mainStatKey: MainStatKey.PYRO_DMG,
        mainStatValue: 34.8,
        substats: [
          { key: SubStatKey.CRIT_RATE, value: 5.4 },
          { key: SubStatKey.ATK_FLAT, value: 14 },
          { key: SubStatKey.ELEM_MASTERY, value: 19 },
        ],
        unactivatedSubstats: [],
        location: 0,
        lock: false,
      },
      shouldBeLocked: true,
    },
    {
      artifact: {
        id: 'wanderer',
        setKey: SetKey.WanderersTroupe,
        slotKey: SlotKey.SANDS,
        rarity: 3,
        level: 4,
        mainStatKey: MainStatKey.ATK_PERCENT,
        mainStatValue: 10.5,
        substats: [
          { key: SubStatKey.DEF_FLAT, value: 12 },
          { key: SubStatKey.HP_PERCENT, value: 3.3 },
        ],
        unactivatedSubstats: [{ key: SubStatKey.CRIT_DAMAGE, value: 5.4 }],
        location: 0,
        lock: true,
      },
      shouldBeLocked: false,
    },
    {
      artifact: {
        id: 'adventurer',
        setKey: SetKey.Adventurer,
        slotKey: SlotKey.CIRCLET,
        rarity: 2,
        level: 0,
        mainStatKey: MainStatKey.CRIT_RATE,
        mainStatValue: 2.1,
        substats: [{ key: SubStatKey.ATK_FLAT, value: 5 }],
        unactivatedSubstats: [],
        location: 0,
        lock: false,
      },
      shouldBeLocked: false,
    },
  ]

// Every rarity and lock state side by side
export const Gallery: ComponentStoryFn<typeof ArtifactCard> = () => (
  <Box
    css={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 16em)',
      alignItems: 'start',
      gap: '$space3',
      padding: '$space4',
      backgroundColor: '$bgSecondary',
    }}
  >
    {sampleArtifacts.map(({ artifact, shouldBeLocked }) => (
      <ArtifactCard
        key={artifact.id}
        artifact={artifact}
        shouldBeLocked={shouldBeLocked}
      />
    ))}
  </Box>
)

Gallery.parameters = {
  layout: 'fullscreen',
}
