import { describe, expect, it } from 'vitest'
import type { Rule } from './build'
import { findMistakes } from './check'
import { LISTED } from './listed'
import { resolve } from './resolve'
import { electronsShown, valenceElectrons } from './structure'

const found = (formula: string, which = '', rule: Rule = 'octet') => {
  const r = resolve({ formula, which, rule, shape: 'flat' })
  if (!r.ok) throw new Error(r.message)
  return r
}
const refused = (formula: string) => {
  const r = resolve({ formula, which: '', rule: 'octet', shape: 'flat' })
  if (r.ok) throw new Error(`${formula} was found`)
  return r
}

describe('finding the structure for a formula', () => {
  it('builds a formula with one central atom', () => {
    const r = found('H2O')
    expect(r.listed).toBeUndefined()
    expect(r.name).toBe('H₂O')
    expect(r.correct).toHaveLength(1)
  })

  it('takes a formula from the list when it’s written as listed', () => {
    expect(found('C2H5OH').listed?.id).toBe('ethanol')
    expect(found('CH3CH2OH').listed?.id).toBe('ethanol')
    expect(found('HNO3').listed?.id).toBe('nitric-acid')
    expect(found('CH3COO-').listed?.id).toBe('acetate')
    expect(found('C2H5OH').choices).toEqual([])
  })

  it('takes a structure typed by its name', () => {
    expect(found('Acetic acid').listed?.id).toBe('acetic-acid')
    expect(found('ethylene').listed?.id).toBe('ethene')
  })

  it('asks which one when two listed structures share a formula', () => {
    const r = found('C2H6O')
    expect(r.choices.map((l) => l.id)).toEqual(['ethanol', 'dimethyl-ether'])
    expect(r.listed?.id).toBe('ethanol')
    expect(found('C2H6O', 'dimethyl-ether').listed?.id).toBe('dimethyl-ether')
  })

  it('names a listed structure by its usual formula', () => {
    expect(found('C2H6O', 'dimethyl-ether').name).toBe('CH₃OCH₃')
  })

  it('offers a generator request for a formula it has no structure for', () => {
    const several = refused('C3H8')
    expect(several.message).toMatch(/more than one central atom/)
    expect(several.request).toBe(true)
    expect(refused('HBrO3').message).toMatch(/H bonds to O/)
    expect(refused('CH5').message).toMatch(/can’t be drawn/)
  })

  it('passes on the formula’s own problem, with no request', () => {
    const r = refused('co2')
    expect(r.message).toMatch(/capital/)
    expect(r.request).toBe(false)
  })

  it('says when the structure rule changes the structure', () => {
    expect(found('SO4 2-').ruleMatters).toBe(true)
    expect(found('SO2').ruleMatters).toBe(true)
    expect(found('H2SO4').ruleMatters).toBe(true)
    expect(found('CH4').ruleMatters).toBe(false)
    expect(found('NO3-').ruleMatters).toBe(false)
  })

  it('gives every resonance structure the same atom positions', () => {
    const r = found('NO3-')
    expect(r.correct).toHaveLength(3)
    for (const s of r.correct) expect(s.atoms.map((a) => [a.x, a.y])).toEqual(r.correct[0].atoms.map((a) => [a.x, a.y]))
  })
})

describe('every listed structure', () => {
  it('builds correctly under both rules, with no mistakes', () => {
    for (const rule of ['octet', 'fewest'] as const)
      for (const l of LISTED) {
        const r = found(l.formula, l.id, rule)
        expect(r.listed?.id, l.id).toBe(l.id)
        expect(r.correct.length, `${l.id} ${rule}`).toBeGreaterThan(0)
        for (const s of r.correct) {
          expect(electronsShown(s), l.id).toBe(valenceElectrons(s))
          expect(findMistakes({ structure: s, correct: r.correct, name: r.name, rule, formalCharges: true }), l.id).toEqual([])
        }
      }
  })

  it('has the resonance structures textbooks show', () => {
    expect(found('N2O').correct).toHaveLength(2)
    expect(found('CH3COO-').correct).toHaveLength(2)
    expect(found('HNO3').correct).toHaveLength(2)
    expect(found('CH3COOH').correct).toHaveLength(1)
    expect(found('C2H2').correct[0].bonds[0].order).toBe(3)
  })

  it('is listed once, with its own formula', () => {
    expect(new Set(LISTED.map((l) => l.id)).size).toBe(LISTED.length)
    for (const l of LISTED) expect(found(l.formula).listed?.id, l.id).toBe(l.id)
  })

  it('has shaped positions for every atom when it has any', () => {
    for (const l of LISTED) if (l.shaped) expect(l.shaped, l.id).toHaveLength(l.atoms.length)
  })
})
