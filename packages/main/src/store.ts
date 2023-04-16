import ElectronStore from 'electron-store'

export const store = new ElectronStore({
  schema: {
    width: {
      type: 'number',
    },
    height: {
      type: 'number',
    },
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
  },
})
