import sharp, { Sharp } from 'sharp'

export async function GBRAtoRGB(image: Sharp): Promise<Sharp> {
  const {
    data: imageBuf,
    info: { width, height },
  } = await image.toBuffer({ resolveWithObject: true })
  // BGRA, we need RGBA
  for (let i = 0; i < imageBuf.byteLength; i += 4) {
    const b = imageBuf.readUInt8(i)
    const r = imageBuf.readUInt8(i + 2)
    imageBuf.writeUInt8(r, i)
    imageBuf.writeUInt8(b, i + 2)
  }

  const sharpBitmap = sharp(imageBuf, {
    raw: {
      width: Number(width),
      height: Number(height),
      channels: 4,
      // premultiplied: true
    },
  })
    .flip()
    .removeAlpha()
    // We need reinitialize in order to "apply" the flip transform. Otherwise `extract()` will reference the unflipped y value.
    .withMetadata()
    .png()
    .toBuffer()
    .then((data) => sharp(data))

  return sharpBitmap
}
