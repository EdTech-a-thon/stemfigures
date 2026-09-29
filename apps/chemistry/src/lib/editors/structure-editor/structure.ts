// A structure drawn by hand in the Organic Structure Editor: atoms placed on
// a square grid and the bonds between them. Everything here is plain data
// and arithmetic, so the page (StructureEditor.svelte) only handles pointers.

export const ELEMENTS = ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I'] as const
export type ElementSymbol = (typeof ELEMENTS)[number]

/** The tray's big cards; the rest are under "More elements". */
export const MAIN_ELEMENTS: { symbol: ElementSymbol; name: string }[] = [
  { symbol: 'C', name: 'Carbon' },
  { symbol: 'H', name: 'Hydrogen' },
  { symbol: 'O', name: 'Oxygen' },
]
export const MORE_ELEMENTS = ELEMENTS.filter((e) => !MAIN_ELEMENTS.some((m) => m.symbol === e))

export type BondOrder = 1 | 2 | 3
export interface Atom { id: string; element: ElementSymbol; x: number; y: number }
export interface Bond { id: string; a: string; b: string; order: BondOrder }
export interface Structure { atoms: Atom[]; bonds: Bond[] }

/** The drawing page, in SVG units, and its grid. Atoms sit on grid points,
 *  never on the page's edge. */
export const WIDTH = 1040
export const HEIGHT = 660
export const GRID = 30

/** Atom symbols' size, and how far bonds stop short of an atom's center. */
export const FONT = 26
const bondGap = (a: Atom) => (a.element.length > 1 ? 21 : 16)
/** Space between the lines of a double or triple bond. */
const BOND_SPACING = 6
/** White space around an exported structure. */
export const EXPORT_PAD = 14

export const emptyStructure = (): Structure => ({ atoms: [], bonds: [] })

export const cloneStructure = (s: Structure): Structure => ({
  atoms: s.atoms.map((a) => ({ ...a })),
  bonds: s.bonds.map((b) => ({ ...b })),
})

/** The line or lines drawing a bond, stopping short of both atoms' symbols. */
export function bondLines(a: Atom, b: Atom, order: BondOrder) {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const ux = (b.x - a.x) / length
  const uy = (b.y - a.y) / length
  const offsets = order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1]
  return offsets.map((o) => ({
    x1: a.x + ux * bondGap(a) - uy * BOND_SPACING * o,
    y1: a.y + uy * bondGap(a) + ux * BOND_SPACING * o,
    x2: b.x - ux * bondGap(b) - uy * BOND_SPACING * o,
    y2: b.y - uy * bondGap(b) + ux * BOND_SPACING * o,
  }))
}

export const nextOrder = (order: BondOrder): BondOrder => (order === 3 ? 1 : ((order + 1) as BondOrder))

export const BOND_NAMES: Record<BondOrder, string> = { 1: 'single', 2: 'double', 3: 'triple' }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** The grid point nearest a point on the page. */
export const snap = (x: number, y: number) => ({
  x: clamp(Math.round(x / GRID) * GRID, GRID, WIDTH - GRID),
  y: clamp(Math.round(y / GRID) * GRID, GRID, HEIGHT - GRID),
})

/** How far a point is from the segment between two atoms. */
function distanceToBond(p: { x: number; y: number }, a: Atom, b: Atom) {
  const [dx, dy] = [b.x - a.x, b.y - a.y]
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/** A free grid point for an atom added without dragging it: the page's
 *  middle, or the nearest point to it a bond's length from every atom and
 *  clear of every bond, working outward. */
export function freeSpot(s: Structure) {
  const byId = new Map(s.atoms.map((a) => [a.id, a]))
  const free = (p: { x: number; y: number }) =>
    s.atoms.every((a) => Math.hypot(a.x - p.x, a.y - p.y) >= 2 * GRID) &&
    s.bonds.every((b) => {
      const [a, c] = [byId.get(b.a), byId.get(b.b)]
      return !a || !c || distanceToBond(p, a, c) >= GRID
    })
  const mid = snap(WIDTH / 2, HEIGHT / 2)
  for (let ring = 0; ring < WIDTH / GRID; ring++)
    for (let dy = -ring; dy <= ring; dy++)
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue
        const p = { x: mid.x + dx * GRID, y: mid.y + dy * GRID }
        if (p.x < GRID || p.x > WIDTH - GRID || p.y < GRID || p.y > HEIGHT - GRID) continue
        if (free(p)) return p
      }
  return mid
}

/** How far a group of atoms moves when dragged by (dx, dy): whole grid
 *  steps, stopping where the first atom would leave the page. */
export function groupShift(origins: { x: number; y: number }[], dx: number, dy: number) {
  const xs = origins.map((p) => p.x)
  const ys = origins.map((p) => p.y)
  return {
    dx: clamp(Math.round(dx / GRID) * GRID, GRID - Math.min(...xs), WIDTH - GRID - Math.max(...xs)),
    dy: clamp(Math.round(dy / GRID) * GRID, GRID - Math.min(...ys), HEIGHT - GRID - Math.max(...ys)),
  }
}

export interface Box { x1: number; y1: number; x2: number; y2: number }

/** The atoms whose centers are inside a box dragged either way. */
export function atomsIn(s: Structure, box: Box) {
  const [left, right] = [Math.min(box.x1, box.x2), Math.max(box.x1, box.x2)]
  const [top, bottom] = [Math.min(box.y1, box.y2), Math.max(box.y1, box.y2)]
  return s.atoms.filter((a) => a.x >= left && a.x <= right && a.y >= top && a.y <= bottom).map((a) => a.id)
}

export function withoutAtoms(s: Structure, ids: Iterable<string>): Structure {
  const gone = new Set(ids)
  return {
    atoms: s.atoms.filter((a) => !gone.has(a.id)),
    bonds: s.bonds.filter((b) => !gone.has(b.a) && !gone.has(b.b)),
  }
}

export const bondBetween = (s: Structure, a: string, b: string) =>
  s.bonds.find((bond) => (bond.a === a && bond.b === b) || (bond.a === b && bond.b === a))

/** The part of the page an export keeps: the atoms' symbols, which reach
 *  past every bond, plus a margin. Null when there is nothing drawn. */
export function cropBox(s: Structure) {
  if (!s.atoms.length) return null
  const halfW = (a: Atom) => (a.element.length > 1 ? 17 : 10)
  const halfH = FONT * 0.37
  const left = Math.min(...s.atoms.map((a) => a.x - halfW(a))) - EXPORT_PAD
  const right = Math.max(...s.atoms.map((a) => a.x + halfW(a))) + EXPORT_PAD
  const top = Math.min(...s.atoms.map((a) => a.y - halfH)) - EXPORT_PAD
  const bottom = Math.max(...s.atoms.map((a) => a.y + halfH)) + EXPORT_PAD
  return { x: left, y: top, width: right - left, height: bottom - top }
}

/** A few words saying what is drawn, for screen readers and the image's label. */
export function describe(s: Structure) {
  if (!s.atoms.length) return 'An empty structure'
  const counts = new Map<string, number>()
  for (const a of s.atoms) counts.set(a.element, (counts.get(a.element) ?? 0) + 1)
  const atoms = [...counts].map(([e, n]) => `${n} ${e}`).join(', ')
  return `A structure of ${s.atoms.length} atom${s.atoms.length === 1 ? '' : 's'} (${atoms}) and ${s.bonds.length} bond${s.bonds.length === 1 ? '' : 's'}`
}

/** A structure read back from browser storage, keeping only well-formed
 *  atoms on the page and bonds between two of them. */
export function tidyStructure(stored: unknown): Structure {
  if (!stored || typeof stored !== 'object') return emptyStructure()
  const { atoms, bonds } = stored as { atoms?: unknown; bonds?: unknown }
  const good = (Array.isArray(atoms) ? atoms : []).filter(
    (a): a is Atom =>
      !!a && typeof a.id === 'string' && ELEMENTS.includes(a.element) &&
      Number.isFinite(a.x) && Number.isFinite(a.y),
  ).map((a) => ({ id: a.id, element: a.element, ...snap(a.x, a.y) }))
  const ids = new Set(good.map((a) => a.id))
  const joined = (Array.isArray(bonds) ? bonds : []).filter(
    (b): b is Bond =>
      !!b && typeof b.id === 'string' && ids.has(b.a) && ids.has(b.b) && b.a !== b.b && [1, 2, 3].includes(b.order),
  ).map((b) => ({ id: b.id, a: b.a, b: b.b, order: b.order }))
  return { atoms: good, bonds: joined }
}
