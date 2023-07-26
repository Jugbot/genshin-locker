import { SetKey } from '@gl/types'
import { expect, test } from 'vitest'

import artifacts from './artifacts.json'

test('artifacts.json', () => {
  const allArtifacts = Object.values(artifacts).map((o) => o.GOOD)

  const allEnums = Object.values(SetKey)

  expect(allEnums.sort()).toEqual(allArtifacts.sort())
})
