import { styled } from '@gl/theme'
import * as RadixSlider from '@radix-ui/react-slider'

const SliderRoot = styled(RadixSlider.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',

  "&[data-orientation='horizontal']": {
    height: '$size4',
    py: '$space1',
  },
  "&[data-orientation='vertical']": {
    width: '$size4',
    px: '$space1',
  },
})

const SliderTrack = styled(RadixSlider.SliderTrack, {
  backgroundColor: '$sandA3',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '$radiusMax',

  "&[data-orientation='horizontal']": {
    height: '$size1',
  },
  "&[data-orientation='vertical']": {
    width: '$size1',
  },
})

const SliderRange = styled(RadixSlider.SliderRange, {
  position: 'absolute',
  backgroundColor: '$bgActionNeutral',
  borderRadius: '$radiusMax',
  height: '100%',
})

const SliderThumb = styled(RadixSlider.SliderThumb, {
  display: 'block',
  width: '$size4',
  height: '$size4',
  backgroundColor: '$bgActionNeutral',
  borderRadius: '$radiusMax',

  '&:hover': {
    backgroundColor: '$bgActionNeutralHover',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: '0 0 0 $space$space1 $colors$blackA8',
  },
})

export const Slider = {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
}
