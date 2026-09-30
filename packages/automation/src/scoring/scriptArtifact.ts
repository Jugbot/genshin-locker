import { Artifact } from '@gl/types'

/**
 * The artifact as passed to locking scripts. Inactive substats are part of
 * `substats` so older scripts keep working.
 */
export type ScriptArtifact = Omit<Artifact, 'unactivatedSubstats'> & {
  /** Whether the last substat is inactive */
  hasInactiveSubstat: boolean
}

export const toScriptArtifact = ({
  unactivatedSubstats,
  ...artifact
}: Artifact): ScriptArtifact => ({
  ...artifact,
  substats: [...artifact.substats, ...unactivatedSubstats],
  hasInactiveSubstat: unactivatedSubstats.length > 0,
})
