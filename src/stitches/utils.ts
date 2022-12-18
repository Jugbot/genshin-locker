import type * as Stitches from '@stitches/react'

const p = (value: Stitches.PropertyValue<'padding'>) => ({
  padding: value,
})
const pt = (value: Stitches.PropertyValue<'paddingTop'>) => ({
  paddingTop: value,
})
const pr = (value: Stitches.PropertyValue<'paddingRight'>) => ({
  paddingRight: value,
})
const pb = (value: Stitches.PropertyValue<'paddingBottom'>) => ({
  paddingBottom: value,
})
const pl = (value: Stitches.PropertyValue<'paddingLeft'>) => ({
  paddingLeft: value,
})
const px = (value: Stitches.PropertyValue<'paddingLeft'>) => ({
  paddingLeft: value,
  paddingRight: value,
})
const py = (value: Stitches.PropertyValue<'paddingTop'>) => ({
  paddingTop: value,
  paddingBottom: value,
})

const m = (value: Stitches.PropertyValue<'margin'>) => ({
  margin: value,
})
const mt = (value: Stitches.PropertyValue<'marginTop'>) => ({
  marginTop: value,
})
const mr = (value: Stitches.PropertyValue<'marginRight'>) => ({
  marginRight: value,
})
const mb = (value: Stitches.PropertyValue<'marginBottom'>) => ({
  marginBottom: value,
})
const ml = (value: Stitches.PropertyValue<'marginLeft'>) => ({
  marginLeft: value,
})
const mx = (value: Stitches.PropertyValue<'marginLeft'>) => ({
  marginLeft: value,
  marginRight: value,
})
const my = (value: Stitches.PropertyValue<'marginTop'>) => ({
  marginTop: value,
  marginBottom: value,
})

export default { p, pt, pr, pb, pl, px, py, m, mt, mr, mb, ml, mx, my }
