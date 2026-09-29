import { describe, expect, it } from 'vitest'
import {
  atomsIn, bondBetween, bondLines, cropBox, EXPORT_PAD, freeSpot, GRID, groupShift, HEIGHT, nextOrder, snap,
  tidyStructure, WIDTH, withoutAtoms, type Atom, type Structure,
} from './structure'

const atom = (id: string, x: number, y: number, element: Atom['element'] = 'C'): Atom => ({ id, element, x, y })
const ethane: Structure = {
  atoms: [atom('a', 300, 300), atom('b', 360, 300), atom('h', 240, 300, 'H')],
  bonds: [{ id: 'ab', a: 'a', b: 'b', order: 1 }, { id: 'ha', a: 'h', b: 'a', order: 1 }],
}

describe('drawing bonds', () => {
  it('draws one, two or three lines, stopping short of the atoms', () => {
    const [a, b] = ethane.atoms
    expect(bondLines(a, b, 1)).toHaveLength(1)
    expect(bondLines(a, b, 2)).toHaveLength(2)
    const [single] = bondLines(a, b, 1)
    expect(single.x1).toBeGreaterThan(a.x)
    expect(single.x2).toBeLessThan(b.x)
    expect(single.y1).toBe(300)
  })

  it('spaces a double bond’s lines evenly either side of the atoms’ line', () => {
    const [top, bottom] = bondLines(ethane.atoms[0], ethane.atoms[1], 2)
    expect(top.y1 + bottom.y1).toBeCloseTo(600)
    expect(Math.abs(top.y1 - bottom.y1)).toBeGreaterThan(0)
  })

  it('cycles single, double, triple, then single again', () => {
    expect([nextOrder(1), nextOrder(2), nextOrder(3)]).toEqual([2, 3, 1])
  })
})

describe('the grid', () => {
  it('snaps to the nearest grid point, never on the page’s edge', () => {
    expect(snap(314, 336)).toEqual({ x: 300, y: 330 })
    expect(snap(-50, HEIGHT + 50)).toEqual({ x: GRID, y: HEIGHT - GRID })
  })

  it('finds the middle for a tapped atom, then the free points around it', () => {
    const first = freeSpot({ atoms: [], bonds: [] })
    expect(first).toEqual(snap(WIDTH / 2, HEIGHT / 2))
    const second = freeSpot({ atoms: [atom('a', first.x, first.y)], bonds: [] })
    expect(second).not.toEqual(first)
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThanOrEqual(2 * GRID)
  })

  it('keeps a tapped atom off the bonds already drawn', () => {
    const mid = snap(WIDTH / 2, HEIGHT / 2)
    const across: Structure = {
      atoms: [atom('l', mid.x - 90, mid.y), atom('r', mid.x + 90, mid.y)],
      bonds: [{ id: 'lr', a: 'l', b: 'r', order: 1 }],
    }
    expect(freeSpot(across).y).not.toBe(mid.y)
  })

  it('moves a group in whole grid steps and keeps every atom on the page', () => {
    const origins = [{ x: 60, y: 300 }, { x: 120, y: 300 }]
    expect(groupShift(origins, 44, 16)).toEqual({ dx: 30, dy: 30 })
    expect(groupShift(origins, -500, 0).dx).toBe(GRID - 60)
  })
})

describe('selecting and deleting', () => {
  it('selects the atoms inside a box dragged either way', () => {
    expect(atomsIn(ethane, { x1: 370, y1: 310, x2: 290, y2: 290 }).sort()).toEqual(['a', 'b'])
  })

  it('deletes atoms along with their bonds', () => {
    const left = withoutAtoms(ethane, ['a'])
    expect(left.atoms.map((a) => a.id)).toEqual(['b', 'h'])
    expect(left.bonds).toEqual([])
  })

  it('finds a bond whichever way round its atoms are given', () => {
    expect(bondBetween(ethane, 'b', 'a')?.id).toBe('ab')
    expect(bondBetween(ethane, 'b', 'h')).toBeUndefined()
  })
})

describe('exporting', () => {
  it('crops to the atoms’ symbols plus a margin', () => {
    const crop = cropBox(ethane)!
    expect(crop.x).toBeLessThan(240 - EXPORT_PAD)
    expect(crop.x + crop.width).toBeGreaterThan(360 + EXPORT_PAD)
    expect(crop.height).toBeLessThan(60)
  })

  it('has nothing to export with nothing drawn', () => {
    expect(cropBox({ atoms: [], bonds: [] })).toBeNull()
  })
})

describe('a structure saved in the browser', () => {
  it('comes back as it was', () => {
    expect(tidyStructure(JSON.parse(JSON.stringify(ethane)))).toEqual(ethane)
  })

  it('drops anything malformed, and bonds to atoms that are gone', () => {
    const stored = {
      atoms: [atom('a', 300, 300), { id: 'x', element: 'Xx', x: 0, y: 0 }, { id: 'y', element: 'O', x: 'no', y: 1 }],
      bonds: [{ id: 'ab', a: 'a', b: 'b', order: 1 }, { id: 'aa', a: 'a', b: 'a', order: 1 }],
    }
    expect(tidyStructure(stored)).toEqual({ atoms: [atom('a', 300, 300)], bonds: [] })
    expect(tidyStructure(null)).toEqual({ atoms: [], bonds: [] })
    expect(tidyStructure('nonsense')).toEqual({ atoms: [], bonds: [] })
  })
})
