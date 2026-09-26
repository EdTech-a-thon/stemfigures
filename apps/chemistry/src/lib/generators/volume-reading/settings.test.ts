import { describe, expect, it } from 'vitest'
import { magnifierView, volumeSettings } from './settings'

describe('the reading in the address', () => {
  it('reaches the top of the 1000 mL cylinder', () => {
    expect(volumeSettings.fromParams(new URLSearchParams('size=1000&reading=870')).reading).toBe(870)
  })
})

describe('the magnifier for each instrument', () => {
  it('a beaker has none unless the teacher turns it on', () => {
    const beaker = volumeSettings.fromParams(new URLSearchParams('instrument=beaker'))
    expect(magnifierView(beaker)).toBe('whole')
    expect(magnifierView({ ...beaker, beakerView: 'both' })).toBe('both')
  })

  it('a cylinder or buret keeps its own, and the beaker’s doesn’t change it', () => {
    const cylinder = volumeSettings.defaults
    expect(magnifierView(cylinder)).toBe('both')
    expect(magnifierView({ ...cylinder, beakerView: 'magnifier' })).toBe('both')
    expect(magnifierView({ ...cylinder, instrument: 'buret', view: 'magnifier' })).toBe('magnifier')
  })

  it('old links without a beaker setting open unchanged', () => {
    expect(volumeSettings.toQuery(volumeSettings.fromParams(new URLSearchParams('view=whole&reading=12')))).toBe('reading=12&view=whole')
  })
})
