import { Artifact } from '../automation/types'
import { Box } from '../components'

export const ArtifactCard = ({ artifact }: { artifact: Artifact }) => {
  return (
    <Box
      css={{
        backgroundColor: '$sand5',
        borderRadius: '$radius3',
        padding: '$space1',
      }}
    >
      {JSON.stringify(artifact, null, 2)}
    </Box>
  )
}
