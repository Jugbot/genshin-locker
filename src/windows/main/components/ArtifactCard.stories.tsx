import { ComponentStory, ComponentMeta } from '@storybook/react'

import {
  Artifact,
  MainStatKey,
  SetKey,
  SlotKey,
  SubStatKey,
} from '../../../automation/types'

import { ArtifactCard } from './ArtifactCard'

export default {
  title: 'ArtifactCard',
  component: ArtifactCard,
  parameters: {
    layout: 'centered',
  },
} as ComponentMeta<typeof ArtifactCard>

const Template: ComponentStory<typeof ArtifactCard> = (args) => (
  <ArtifactCard {...args} css={{ minWidth: '15em' }} />
)

export const FirstStory = Template.bind({})

FirstStory.args = {
  artifact: {
    name: 'Name',
    mainStatValue: 70,
    setKey: SetKey.Adventurer,
    slotKey: SlotKey.FLOWER,
    rarity: 5,
    mainStatKey: MainStatKey.ANEMO_DMG,
    level: 20,
    substats: [{ key: SubStatKey.ATK_FLAT, value: 10 }],
    location: 0,
    lock: false,
    id: '',
  } satisfies Artifact,
  score: 100,
}
