import { describe, expect, it } from 'vitest'
import { bohrFigure } from './figure'
import { modelSide } from './model'
import { bohrSettings, drawnNucleus, pairingSkipped } from './settings'

const d = bohrSettings.defaults
const fromQuery = (query: string) => bohrSettings.fromParams(new URLSearchParams(query))

describe('settings in the address', () => {
  it('are left out at their defaults', () => {
    expect(bohrSettings.toQuery(d)).toBe('')
  })

  it('write the electrons readably and travel intact', () => {
    const s = { ...d, protons: 11, neutrons: 12, electrons: [2, 8, 1], electronSymbol: '-' as const, key: true }
    const query = bohrSettings.toQuery(s)
    expect(query).toContain('electrons=2-8-1')
    expect(fromQuery(query)).toEqual(s)
  })

  it('keep counts within their limits', () => {
    const s = fromQuery('protons=500&neutrons=-3&electrons=40-2')
    expect(s).toMatchObject({ protons: 200, neutrons: 0, electrons: [32, 2] })
  })

  it('ignore shells they can’t read', () => {
    expect(fromQuery('electrons=2-8-8-8-8-8-8-8').electrons).toEqual(d.electrons)
    expect(fromQuery('electrons=abc').electrons).toEqual(d.electrons)
    expect(bohrSettings.tidy({ electrons: [] }).electrons).toEqual(d.electrons)
  })
})

describe('the figure', () => {
  it('draws a ball nucleus as text past 40 protons and neutrons', () => {
    expect(drawnNucleus({ ...d, protons: 20, neutrons: 20 })).toBe('balls')
    expect(drawnNucleus({ ...d, protons: 20, neutrons: 21 })).toBe('text')
    expect(bohrFigure({ ...d, protons: 26, neutrons: 30 }).balls).toEqual([])
  })

  it('is the same size for every model with the same number of shells', () => {
    const a = bohrFigure({ ...d, protons: 1, neutrons: 0, electrons: [1, 0] })
    const b = bohrFigure({ ...d, protons: 30, neutrons: 10, electrons: [32, 32], electronSymbol: 'e-', nucleus: 'text' })
    expect([a.width, a.height]).toEqual([modelSide(2), modelSide(2)])
    expect([b.width, b.height]).toEqual([a.width, a.height])
  })

  it('draws empty rings without electrons, still one ring per shell', () => {
    const f = bohrFigure({ ...d, electrons: [2, 8, 1], emptyRings: true })
    expect(f.rings).toHaveLength(3)
    expect(f.rings.every((r) => !r.electrons.length)).toBe(true)
  })

  it('lists in the key only what is drawn as a ball or dot', () => {
    const names = (s: typeof d) => bohrFigure({ ...s, key: true }).key?.lines.map((l) => l.name)
    expect(names(d)).toEqual(['Proton', 'Neutron', 'Electron'])
    expect(names({ ...d, nucleus: 'text' })).toEqual(['Electron'])
    expect(names({ ...d, nucleus: 'blank', emptyRings: true })).toBeUndefined()
    expect(bohrFigure(d).key).toBeUndefined()
  })

  it('puts the key to the right of the model', () => {
    const f = bohrFigure({ ...d, key: true })
    expect(f.key!.x).toBeGreaterThan(modelSide(2))
    expect(f.width).toBe(f.key!.x + f.key!.width)
  })

  it('says when a shell has too many electrons to pair', () => {
    expect(pairingSkipped({ ...d, placement: 'paired', electrons: [2, 8] })).toBe(false)
    expect(pairingSkipped({ ...d, placement: 'paired', electrons: [2, 9] })).toBe(true)
  })
})
