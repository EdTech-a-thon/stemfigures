// Lays out a coordinate grid as plain numbers for Graph.svelte to draw: the
// grid itself from $shared/graph, then what the teacher graphed on it.

import { niceText } from '$shared/graph/numbering'
import { layoutGrid, pathOf, round } from '$shared/graph/grid'
import { COLORS, clipLine, readEquations, type Point } from './equations.js'
import { readAxes, type Settings } from './settings.js'

export { CELL } from '$shared/graph/grid'
const HEAD = 12 // length of an arrowhead where a graphed line leaves the grid
const HEAD_HALF = 5.5 // half its width
const CIRCLE_R = 5.5 // a hole's or endpoint's circle
const NAME_GAP = 7 // how far a point name sits up and right of its point

const pathLength = (pts: Point[]) => pts.reduce((sum, p, k) => (k ? sum + Math.hypot(p.x - pts[k - 1].x, p.y - pts[k - 1].y) : 0), 0)

/**
 * An arrowhead at the last point of a path, pointing along it, and the path
 * cut back to the arrowhead's base so the line doesn't poke through its tip.
 */
function arrowAt(pts: Point[], heads: string[]): { pts: Point[] } {
  const tip = pts.at(-1)!
  // Walk back one arrowhead's length along the path to find the base.
  let k = pts.length - 1
  let left = HEAD
  let base = tip
  while (k > 0) {
    const a = pts[k - 1]
    const b = pts[k]
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (seg >= left) {
      const t = left / seg
      base = { x: b.x + (a.x - b.x) * t, y: b.y + (a.y - b.y) * t }
      break
    }
    left -= seg
    k--
  }
  const len = Math.hypot(tip.x - base.x, tip.y - base.y) || 1
  const u = { x: (tip.x - base.x) / len, y: (tip.y - base.y) / len }
  heads.push(
    `M${round(tip.x)},${round(tip.y)} L${round(base.x - u.y * HEAD_HALF)},${round(base.y + u.x * HEAD_HALF)} L${round(base.x + u.y * HEAD_HALF)},${round(base.y - u.x * HEAD_HALF)} z`,
  )
  // Stop the line just inside the arrowhead's base, so they overlap a little.
  const inset = { x: base.x + u.x * 1, y: base.y + u.y * 1 }
  return { pts: [...pts.slice(0, k), inset] }
}

/** A coordinate grid laid out for Graph.svelte to draw. */
export type GraphLayout = ReturnType<typeof buildGraph>

export function buildGraph(settings: Settings) {
  const axes = readAxes(settings)
  const { x, y } = axes
  const { px, box, ...grid } = layoutGrid(settings, axes)

  // What the teacher graphed: each line or curve runs to the grid's edge, with
  // an arrowhead where it leaves at the ends the teacher picked; points are dots or crosses.
  const lines: { d: string; heads: string[]; color: string; dash: string | undefined; cap: 'round' | 'butt'; width: number }[] = []
  const dots: (Point & { color: string; cross: boolean })[] = []
  // Holes and endpoints: open circles (not included) and closed ones (included).
  const circles: (Point & { color: string; closed: boolean })[] = []
  const pointNames: (Point & { name: string; coords: string; color: string })[] = []
  // Asymptotes, when a row shows them: dotted lines in the row's color, under the curves.
  const asymptotes: { d: string; color: string }[] = []
  const rows = settings.equations ?? []
  readEquations(rows.map((r) => r.text), box, settings.angle).forEach((read, i) => {
    const { color, line: style, arrows, point, names, ends, asym } = rows[i]
    const ink = COLORS[color]
    if (asym === 'shown') {
      for (const a of read?.asymptotes ?? []) {
        const seg = clipLine(a, box)
        if (seg) asymptotes.push({ d: `M${seg.map(px).map((p) => `${round(p.x)},${round(p.y)}`).join(' L')}`, color: ink })
      }
    }
    for (const run of read?.runs ?? []) {
      let pts = run.points.map(px)
      const heads: string[] = []
      // Arrows go on ends that leave the grid, if the teacher wants that end.
      const want = [arrows === 'both' || arrows === 'left', arrows === 'both' || arrows === 'right']
      if (pathLength(pts) > HEAD * 2.5) {
        if (want[1] && run.edges[1]) ({ pts } = arrowAt(pts, heads))
        if (want[0] && run.edges[0]) {
          const r = arrowAt([...pts].reverse(), heads)
          pts = r.pts.reverse()
        }
      }
      lines.push({
        d: pathOf(pts),
        heads,
        color: ink,
        dash: style === 'dashed' ? '9 6' : style === 'dotted' ? '0.01 6' : undefined,
        cap: style === 'dotted' ? 'round' : 'butt',
        width: style === 'dotted' ? 3.2 : 2.5, // round dots look lighter than a solid stroke
      })
    }
    for (const c of read?.circles ?? []) if (!(c.end && ends === 'hidden')) circles.push({ ...px(c), color: ink, closed: c.closed })
    for (const pt of read?.points ?? []) {
      const at = px(pt)
      dots.push({ ...at, color: ink, cross: point === 'cross' })
      // Point names sit up and to the right of their point.
      const coords = names === 'coords' ? `(${niceText(pt.x, x.numbering)}, ${niceText(pt.y, y.numbering)})` : ''
      if (pt.name || coords) pointNames.push({ x: at.x + NAME_GAP, y: at.y - NAME_GAP, name: pt.name ?? '', coords, color: ink })
    }
  })

  return {
    ...grid,
    lines,
    dots,
    circles,
    r: CIRCLE_R,
    pointNames,
    asymptotes,
  }
}
