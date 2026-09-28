import { describe, expect, it } from 'vitest'
import { curveThrough, equivalenceMl, keyPointsOf, phAt, sampleVolumes, type Analyte, type Chemistry, type KeyPoints } from './curve'

const chem = (analyte: Analyte, pK = 0, analyteM = 0.1, analyteMl = 25, titrantM = 0.1): Chemistry => ({ analyte, analyteM, analyteMl, titrantM, pK })

describe('pH from the chemistry', () => {
  it('matches the textbook for 25 mL of 0.1 M HCl with 0.1 M NaOH', () => {
    const c = chem('strong-acid')
    expect(equivalenceMl(c)).toBe(25)
    expect(phAt(c, 0)).toBeCloseTo(1, 2)
    expect(phAt(c, 12.5)).toBeCloseTo(1.48, 2) // 1.25 mmol left in 37.5 mL
    expect(phAt(c, 25)).toBeCloseTo(7, 2)
    expect(phAt(c, 50)).toBeCloseTo(12.52, 2) // 2.5 mmol OH⁻ in 75 mL
  })

  it('puts a weak acid’s half-equivalence point at its pKa', () => {
    const c = chem('weak-acid', 4.76)
    expect(phAt(c, 0)).toBeCloseTo(2.88, 1)
    expect(phAt(c, 12.5)).toBeCloseTo(4.76, 1)
    expect(phAt(c, 25)).toBeCloseTo(8.72, 1)
  })

  it('titrates a weak base with a strong acid, pH falling, halfway at 14 − pKb', () => {
    const c = chem('weak-base', 4.75)
    expect(phAt(c, 0)).toBeCloseTo(11.12, 1)
    expect(phAt(c, 12.5)).toBeCloseTo(9.25, 1)
    expect(phAt(c, 25)).toBeCloseTo(5.28, 1)
    expect(phAt(c, 50)).toBeCloseTo(1.48, 1)
  })

  it('titrates a strong base down through 7', () => {
    const c = chem('strong-base')
    expect(phAt(c, 0)).toBeCloseTo(13, 2)
    expect(phAt(c, 25)).toBeCloseTo(7, 2)
  })

  it('finds the equivalence point from the moles', () => {
    expect(equivalenceMl(chem('weak-acid', 4.76, 0.2, 20, 0.1))).toBeCloseTo(40)
  })
})

describe('a curve through key points', () => {
  const cases: [Analyte, KeyPoints][] = [
    ['strong-acid', { startPH: 1, eqMl: 25, eqPH: 7, endPH: 12.5 }],
    ['weak-acid', { startPH: 2.9, eqMl: 25, eqPH: 8.7, endPH: 12.3 }],
    ['weak-acid', { startPH: 3.5, eqMl: 18, eqPH: 9.2, endPH: 11.8 }],
    ['strong-base', { startPH: 13, eqMl: 30, eqPH: 7, endPH: 1.5 }],
    ['weak-base', { startPH: 11.1, eqMl: 25, eqPH: 5.3, endPH: 1.5 }],
    // Not what a strong acid does, but the curve still goes through the points.
    ['strong-acid', { startPH: 2, eqMl: 10, eqPH: 9, endPH: 13.5 }],
  ]
  it.each(cases)('%s through %j', (analyte, p) => {
    const ph = curveThrough(analyte, p, 50)
    expect(ph(0)).toBeCloseTo(p.startPH, 6)
    expect(ph(p.eqMl)).toBeCloseTo(p.eqPH, 6)
    expect(ph(50)).toBeCloseTo(p.endPH, 6)
    // Always heading one way.
    const values = sampleVolumes(p.eqMl, 50).map(ph)
    const rising = p.endPH > p.startPH
    values.slice(1).forEach((v, i) => (rising ? expect(v).toBeGreaterThanOrEqual(values[i] - 1e-9) : expect(v).toBeLessThanOrEqual(values[i] + 1e-9)))
  })

  it('draws the same curve as the chemistry it came from', () => {
    const c = chem('weak-acid', 4.76)
    const ph = curveThrough('weak-acid', keyPointsOf(c, 50), 50)
    for (const v of [5, 12.5, 20, 24, 26, 35]) expect(ph(v)).toBeCloseTo(phAt(c, v), 0)
  })
})
