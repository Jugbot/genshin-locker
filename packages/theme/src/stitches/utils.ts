import type { PropertyValue } from '@stitches/react'

const p = (value: PropertyValue<'padding'>) => ({
  padding: value,
})
const pt = (value: PropertyValue<'paddingTop'>) => ({
  paddingTop: value,
})
const pr = (value: PropertyValue<'paddingRight'>) => ({
  paddingRight: value,
})
const pb = (value: PropertyValue<'paddingBottom'>) => ({
  paddingBottom: value,
})
const pl = (value: PropertyValue<'paddingLeft'>) => ({
  paddingLeft: value,
})
const px = (value: PropertyValue<'paddingLeft'>) => ({
  paddingLeft: value,
  paddingRight: value,
})
const py = (value: PropertyValue<'paddingTop'>) => ({
  paddingTop: value,
  paddingBottom: value,
})

const m = (value: PropertyValue<'margin'>) => ({
  margin: value,
})
const mt = (value: PropertyValue<'marginTop'>) => ({
  marginTop: value,
})
const mr = (value: PropertyValue<'marginRight'>) => ({
  marginRight: value,
})
const mb = (value: PropertyValue<'marginBottom'>) => ({
  marginBottom: value,
})
const ml = (value: PropertyValue<'marginLeft'>) => ({
  marginLeft: value,
})
const mx = (value: PropertyValue<'marginLeft'>) => ({
  marginLeft: value,
  marginRight: value,
})
const my = (value: PropertyValue<'marginTop'>) => ({
  marginTop: value,
  marginBottom: value,
})

export default { p, pt, pr, pb, pl, px, py, m, mt, mr, mb, ml, mx, my }
