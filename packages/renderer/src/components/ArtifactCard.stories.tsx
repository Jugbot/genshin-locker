import { MainStatKey, SetKey, SlotKey, SubStatKey } from '@gl/types'
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
