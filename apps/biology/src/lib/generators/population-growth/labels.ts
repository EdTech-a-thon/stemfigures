// Placing labels on a graph so they never sit on a line or on each other.
// Each label offers places to go, best first; it takes the first that
// touches nothing and keeps a little clear of every line (or, if none
// does, the one touching least). Lines, dots and labels already placed are
// in its way.

import type { Point } from '$shared/graph/grid'

export type Box = { x0: number; y0: number; x1: number; y1: number }
export type Anchor = 'start' | 'middle' | 'end'
/** Where a label could go: its baseline's anchor point. */
export type Spot = { x: number; y: number; anchor: Anchor }
type Segment = { x1: number; y1: number; x2: number; y2: number }

const PAD = 3 // the clear space kept around a label
const CLOSE = 7 // labels this close to a line are kept if nothing better is free

/** The box a line of text takes up, `width` wide in letters `fs` high. */
export function textBox({ x, y, anchor }: Spot, width: number, fs: number): Box {
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2
  return { x0, y0: y - fs * 0.78, x1: x0 + width, y1: y + fs * 0.24 }
}

/** Whether a segment passes through a box (Liang–Barsky). */
function crosses(s: Segment, b: Box) {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  let t0 = 0
  let t1 = 1
  for (const [p, q] of [[-dx, s.x1 - b.x0], [dx, b.x1 - s.x1], [-dy, s.y1 - b.y0], [dy, b.y1 - s.y1]]) {
    if (p === 0) {
      if (q < 0) return false
    } else {
      const t = q / p
      if (p < 0) t0 = Math.max(t0, t)
      else t1 = Math.min(t1, t)
      if (t0 > t1) return false
    }
  }
  return true
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const grow = (b: Box, by: number): Box => ({ x0: b.x0 - by, y0: b.y0 - by, x1: b.x1 + by, y1: b.y1 + by })

export function placer(bounds: Box) {
  const segments: Segment[] = []
  const soft: Segment[] = []
  const boxes: Box[] = []

  return {
    /** A line labels keep off; `soft` ones (like the phase edges) they cross only if they must. */
    line(pts: Point[], isSoft = false) {
      for (let k = 1; k < pts.length; k++) (isSoft ? soft : segments).push({ x1: pts[k - 1].x, y1: pts[k - 1].y, x2: pts[k].x, y2: pts[k].y })
    },
    box(b: Box) {
      boxes.push(b)
    },
    /** The best of `spots` for a label `width` wide; it's then in the way of later labels. */
    place(spots: Spot[], width: number, fs: number): Spot & { box: Box } {
      return this.choose(spots.map((spot) => ({ ...spot, box: textBox(spot, width, fs) })))
    },
    /** The best of places whose boxes are already worked out (for text turned on its side). */
    choose<T extends { box: Box }>(options: T[]): T {
      let best = options[0]
      let bestScore = Infinity
      for (const option of options) {
        const { box } = option
        const near = grow(box, PAD)
        const close = grow(box, CLOSE)
        const outside = box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1
        let score = outside ? 1000 : 0
        for (const b of boxes) if (overlaps(near, b)) score += 100
        for (const s of segments) score += crosses(s, near) ? 10 : crosses(s, close) ? 0.5 : 0
        for (const s of soft) if (crosses(s, near)) score += 1
        if (score < bestScore) {
          best = option
          bestScore = score
          if (score === 0) break
        }
      }
      boxes.push(best.box)
      return best
    },
  }
}

/** Places beside a point: below right, above left, then level and the other corners. */
export function besidePoint(p: Point, fs: number, gap = 12): Spot[] {
  return [
    { x: p.x + gap, y: p.y + fs * 1.3, anchor: 'start' },
    { x: p.x - gap, y: p.y - fs * 0.55, anchor: 'end' },
    { x: p.x + gap, y: p.y + fs * 0.35, anchor: 'start' },
    { x: p.x - gap, y: p.y + fs * 0.35, anchor: 'end' },
    { x: p.x + gap, y: p.y - fs * 0.55, anchor: 'start' },
    { x: p.x - gap, y: p.y + fs * 1.3, anchor: 'end' },
  ]
}

/**
 * Places along a drawn curve, from its far end back, each with the label
 * above left, below right, above right and below left of the curve.
 */
export function alongCurve(pts: Point[], fs: number): Spot[] {
  const spots: Spot[] = []
  if (pts.length < 2) return spots
  // Points evenly spaced along the curve's length, about every 24 units.
  const lengths = [0]
  for (let k = 1; k < pts.length; k++) lengths.push(lengths[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y))
  const total = lengths.at(-1)!
  let k = pts.length - 1
  for (let at = total * 0.97; at >= total * 0.03; at -= 24) {
    while (k > 0 && lengths[k - 1] > at) k--
    const p = pts[k]
    spots.push(
      { x: p.x - 8, y: p.y - 9, anchor: 'end' },
      { x: p.x + 8, y: p.y + fs + 4, anchor: 'start' },
      { x: p.x + 8, y: p.y - 9, anchor: 'start' },
      { x: p.x - 8, y: p.y + fs + 4, anchor: 'end' },
    )
  }
  return spots
}
