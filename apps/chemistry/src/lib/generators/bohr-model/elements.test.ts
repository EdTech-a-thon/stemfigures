import { describe, expect, it } from 'vitest'
import { ELEMENTS, MAX_Z, element, groundStateShells } from './elements'

describe('ground-state shells', () => {
  it('knows the arrangements textbooks show', () => {
    const known: [string, number[]][] = [
      ['H', [1]],
      ['He', [2]],
      ['C', [2, 4]],
      ['Na', [2, 8, 1]],
      ['Ar', [2, 8, 8]],
      ['K', [2, 8, 8, 1]],
      ['Ca', [2, 8, 8, 2]],
      ['Fe', [2, 8, 14, 2]],
      ['Cr', [2, 8, 13, 1]],
      ['Cu', [2, 8, 18, 1]],
      ['Br', [2, 8, 18, 7]],
      ['Pd', [2, 8, 18, 18]],
      ['Au', [2, 8, 18, 32, 18, 1]],
      ['U', [2, 8, 18, 32, 21, 9, 2]],
      ['Og', [2, 8, 18, 32, 32, 18, 8]],
    ]
    for (const [symbol, shells] of known) expect(groundStateShells(ELEMENTS.find((e) => e.symbol === symbol)!.z), symbol).toEqual(shells)
  })

  it('adds up to the atomic number with no shell over 2n², for every element', () => {
    for (let z = 1; z <= MAX_Z; z++) {
      const shells = groundStateShells(z)!
      expect(shells.reduce((a, b) => a + b, 0), element(z)!.symbol).toBe(z)
      shells.forEach((e, i) => expect(e).toBeLessThanOrEqual(2 * (i + 1) ** 2))
      expect(shells.length).toBeLessThanOrEqual(7)
    }
  })

  it('has none for a proton count no element has', () => {
    expect(groundStateShells(0)).toBeUndefined()
    expect(groundStateShells(119)).toBeUndefined()
  })
})
