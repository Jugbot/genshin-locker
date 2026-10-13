import sharp, { Sharp } from 'sharp'

/**
 * Converts a top-down BGRA pixel buffer into an RGB image.
 * The result stays as raw pixels so later extracts do not need to decode anything.
 */
export function BGRAtoRGB(
  imageBuf: Buffer,
  width: number,
  height: number
): Sharp {
  const pixelCount = width * height
  const rgbBuf = Buffer.allocUnsafe(pixelCount * 3)
  for (let src = 0, dst = 0; dst < rgbBuf.length; src += 4, dst += 3) {
    rgbBuf[dst] = imageBuf[src + 2]
    rgbBuf[dst + 1] = imageBuf[src + 1]
    rgbBuf[dst + 2] = imageBuf[src]
  }

  return sharp(rgbBuf, {
    raw: {
      width,
      height,
      channels: 3,
    },
  })
}
