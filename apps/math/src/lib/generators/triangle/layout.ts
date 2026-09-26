// Lays out a solved triangle as plain shapes for Triangle.svelte to draw: its
// corners, angle arcs and right-angle squares, congruence ticks, heights, and
// every label with the spot it sits at.
//
// The triangle is scaled to fit the same box whatever its measures, so every
// figure pastes in at a similar size; the SVG's frame then grows to hold its
// labels. A label the teacher drags keeps its offset in its part's own
// directions (along and across a side, say), so it follows the part when the
// triangle is turned, flipped or reshaped.

import { layoutMath, type MathBox } from '$lib/shared/mathSvg.js'
import { ANGLES, OPPOSITE, sideOf, type Part, type Side, type Solved, type Vertex } from './solve.js'
import { readMoved, type LineStyle, type Offset, type Settings } from './settings.js'

export const FS = 20 // label font size
const NAME_FS = 21
const FIT_W = 440
const FIT_H = 320
const PAD = 12
const ARC = 24 // angle arc radius
const ARC_GAP = 4.5 // between congruence arcs
const SQUARE = 14 // right-angle square
const TICK = 7 // half a congruence tick
const TICK_GAP = 5
const RIGHT = 1e-6 // how close to 90° counts as a right angle

const RAD = Math.PI / 180
/** A point or a direction, in the figure's own units (SVG's, y down). */
export type Vec = [number, number]
const add = (p: Vec, q: Vec): Vec => [p[0] + q[0], p[1] + q[1]]
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1]]
const mul = (p: Vec, k: number): Vec => [p[0] * k, p[1] * k]
const dot = (p: Vec, q: Vec) => p[0] * q[0] + p[1] * q[1]
const len = (p: Vec) => Math.hypot(p[0], p[1])
const unit = (p: Vec) => mul(p, 1 / (len(p) || 1))
const perp = (p: Vec): Vec => [-p[1], p[0]]
const r1 = (v: number) => Math.round(v * 10) / 10

/** How far a label's box reaches from its middle in direction d. */
const reach = (box: MathBox, d: Vec) => (box.w / 2) * Math.abs(d[0]) + ((box.asc + box.desc) / 2) * Math.abs(d[1])

/** A label placed on the figure. `part` is what it labels: a side or angle ("AB", "B"), a vertex name ("vB"), a height ("hB") or where it lands ("fB"). */
export type PlacedLabel = { part: string; box: MathBox; cx: number; cy: number; x: number; y: number; along: Vec; across: Vec; offset: Offset }

/** A triangle laid out for Triangle.svelte to draw. */
export type TriangleLayout = ReturnType<typeof buildTriangle>

/**
 * @param s        clean settings
 * @param triangle a solved triangle: { angles, sides, sized }
 * @param given    the measures as typed numbers, null where solved
 */
export function buildTriangle(s: Settings, triangle: Pick<Solved, 'angles' | 'sides' | 'sized'>, given: Record<Part, number | null>) {
  const { angles, sides, sized } = triangle
  const name = (v: Vertex) => s[`name${v}`].trim()

  // Corners with the base side flat along the bottom and the third corner above
  // it, flipped and turned, then in SVG's y-down coordinates.
  const [P, Q] = [s.base[0] as Vertex, s.base[1] as Vertex]
  const R = ANGLES.find((v) => v !== P && v !== Q)!
  const pr = sides[sideOf(P, R)]
  let pts = { [P]: [0, 0], [Q]: [sides[s.base], 0], [R]: [pr * Math.cos(angles[P] * RAD), pr * Math.sin(angles[P] * RAD)] } as Record<Vertex, Vec>
  const turn = s.rotate * RAD
  for (const v of ANGLES) {
    let [x, y] = pts[v]
    if (s.flip) x = -x
    pts[v] = [x * Math.cos(turn) - y * Math.sin(turn), -(x * Math.sin(turn) + y * Math.cos(turn))]
  }
  const xs = ANGLES.map((v) => pts[v][0])
  const ys = ANGLES.map((v) => pts[v][1])
  const scale = Math.min(FIT_W / (Math.max(...xs) - Math.min(...xs) || 1), FIT_H / (Math.max(...ys) - Math.min(...ys) || 1))
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)]
  for (const v of ANGLES) pts[v] = [(pts[v][0] - x0) * scale, (pts[v][1] - y0) * scale]

  const moved = readMoved(s.moved)
  const labels: PlacedLabel[] = []
  const overlaps = (box: MathBox, [cx, cy]: Vec) =>
    labels.some((l) => Math.abs(l.cx - cx) < (l.box.w + box.w) / 2 + 3 && Math.abs(l.cy - cy) < (l.box.asc + l.box.desc + box.asc + box.desc) / 2 + 2)
  // `slide`: how far the label may move along its part to clear the labels already placed.
  const place = (part: string, box: MathBox | null, center: Vec, along: Vec, across: Vec, slide = 0) => {
    if (!box) return
    for (let k = 1; slide && overlaps(box, center) && k * 8 <= slide; k++) {
      const tries = [add(center, mul(along, k * 8)), add(center, mul(along, -k * 8))].filter((c) => !overlaps(box, c))
      if (tries.length) center = tries[0]
    }
    const o = moved[part] ?? [0, 0]
    const [cx, cy] = add(center, add(mul(along, o[0]), mul(across, o[1])))
    labels.push({ part, box, cx, cy, x: cx - box.w / 2, y: cy + (box.asc - box.desc) / 2, along, across, offset: o })
  }

  const rounded = (v: number) => String(Number(v.toFixed(s.round)))
  const unitText = s.unit.trim() ? ` ${s.unit.trim()}` : ''
  /** What's written at a side or angle, as math, or null for nothing. */
  function content(key: Part, value: number, isAngle: boolean) {
    let mode = s[`${key}Label`]
    if (mode === 'auto') mode = given[key] != null ? 'measure' : 'none'
    if (mode === 'text') return layoutMath(s[`${key}Text`], FS)
    if (mode !== 'measure' || (!isAngle && !sized)) return null
    const text = given[key] != null ? s[key] : rounded(value)
    return layoutMath(text, FS, { suffix: isAngle ? '°' : unitText })
  }

  // Angles: an arc (or congruence arcs) when labeled or marked, a square at a right angle.
  const arcs: string[] = []
  const squares: [Vec, Vec, Vec][] = []
  for (const v of ANGLES) {
    const [a, b] = ANGLES.filter((x) => x !== v)
    const u1 = unit(sub(pts[a], pts[v]))
    const u2 = unit(sub(pts[b], pts[v]))
    const bis = unit(add(u1, u2))
    const room = 0.4 * Math.min(len(sub(pts[a], pts[v])), len(sub(pts[b], pts[v])))
    const box = content(v, angles[v], true)
    const count = s[`${v}Arcs`]
    let outer = 0
    if (s.square && Math.abs(angles[v] - 90) < RIGHT) {
      const q = Math.min(SQUARE, room)
      squares.push([add(pts[v], mul(u1, q)), add(pts[v], add(mul(u1, q), mul(u2, q))), add(pts[v], mul(u2, q))])
      outer = q * Math.SQRT2
    } else if (box || count) {
      const r0 = Math.min(ARC, room)
      const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0
      for (let i = 0; i < Math.max(1, count); i++) {
        const r = r0 + i * ARC_GAP
        const [p, q] = [add(pts[v], mul(u1, r)), add(pts[v], mul(u2, r))]
        arcs.push(`M${r1(p[0])},${r1(p[1])} A${r1(r)},${r1(r)} 0 0 ${sweep} ${r1(q[0])},${r1(q[1])}`)
      }
      outer = r0 + (Math.max(1, count) - 1) * ARC_GAP
    }
    if (box) {
      // Between the two sides, or when a height splits the angle, in the wider
      // part, so the height doesn't run through the label.
      let [e1, e2, spread] = [u1, u2, angles[v] * RAD]
      if (s[`h${v}`]) {
        const [a2, b2] = OPPOSITE[v].split('') as Vertex[]
        const dir = sub(pts[b2], pts[a2])
        const foot = add(pts[a2], mul(dir, dot(sub(pts[v], pts[a2]), dir) / dot(dir, dir)))
        const down = unit(sub(foot, pts[v]))
        const [w1, w2] = [u1, u2].map((u) => Math.acos(Math.max(-1, Math.min(1, dot(u, down)))))
        const inside = Math.abs(w1 + w2 - spread) < 1e-6 // the height runs inside this angle
        if (inside && Math.min(w1, w2) > 1e-3) [e1, e2, spread] = w1 > w2 ? [u1, down, w1] : [down, u2, w2]
      }
      const mid = unit(add(e1, e2))
      // Far enough in to clear the arc, and to fit between its two edges.
      const half = Math.sin(spread / 2)
      const toSide = Math.max(...[e1, e2].map((u) => (reach(box, perp(u)) + 3) / half))
      const d = Math.max(outer + 5 + reach(box, mid), toSide)
      place(v, box, add(pts[v], mul(mid, d)), mid, perp(mid))
    }
    const nameBox = name(v) ? layoutMath(name(v), NAME_FS, { upright: false }) : null
    if (nameBox) {
      const out = mul(bis, -1)
      place(`v${v}`, nameBox, add(pts[v], mul(out, 7 + reach(nameBox, out))), out, perp(out))
    }
  }

  // Sides: congruence ticks across the middle, the label just outside it.
  const ticks: [Vec, Vec][] = []
  for (const side of ['AB', 'BC', 'CA'] as Side[]) {
    const [p, q] = [pts[side[0] as Vertex], pts[side[1] as Vertex]]
    const far = pts[OPPOSITE[side]]
    const mid = mul(add(p, q), 0.5)
    const t = unit(sub(q, p))
    let n = perp(t)
    if (dot(n, sub(far, mid)) > 0) n = mul(n, -1)
    const count = s[`${side}Ticks`]
    for (let i = 0; i < count; i++) {
      const c = add(mid, mul(t, (i - (count - 1) / 2) * TICK_GAP))
      ticks.push([add(c, mul(n, TICK)), add(c, mul(n, -TICK))])
    }
    const box = content(side, sides[side], false)
    if (box) place(side, box, add(mid, mul(n, (count ? TICK + 6 : 6) + reach(box, n))), t, n)
  }

  // Heights: from a corner straight to the line of the side across from it,
  // which runs on (dashed) when the height lands outside the triangle.
  const heights: { from: Vec; to: Vec; style: LineStyle }[] = []
  const extensions: [Vec, Vec][] = []
  for (const v of ANGLES) {
    const h = `h${v}` as const
    if (!s[h]) continue
    const [a, b] = OPPOSITE[v].split('') as Vertex[]
    const dir = sub(pts[b], pts[a])
    const t = dot(sub(pts[v], pts[a]), dir) / dot(dir, dir)
    const foot = add(pts[a], mul(dir, t))
    const up = unit(sub(pts[v], foot))
    const onCorner = Math.abs(t) < 1e-6 || Math.abs(t - 1) < 1e-6 // the height is a side
    let along = unit(t < 0.5 ? sub(pts[b], foot) : sub(pts[a], foot)) // toward the side, for the square
    if (t < 0) along = unit(sub(pts[a], foot))
    if (t > 1) along = unit(sub(pts[b], foot))
    if (!onCorner) {
      // Drawn out from the foot, so the dashes start whole at the right angle there.
      heights.push({ from: foot, to: pts[v], style: s[`${h}Style`] })
      if (t < 0) extensions.push([foot, pts[a]])
      if (t > 1) extensions.push([foot, pts[b]])
      if (s.square) {
        const q = Math.min(12, len(sub(pts[v], foot)) * 0.4)
        squares.push([add(foot, mul(along, q)), add(foot, add(mul(along, q), mul(up, q))), add(foot, mul(up, q))])
      }
    }
    let box: MathBox | null = null
    if (s[`${h}Label`] === 'text') box = layoutMath(s[`${h}Text`], FS)
    else if (s[`${h}Label`] === 'measure' && sized) box = layoutMath(rounded(len(sub(pts[v], foot)) / scale), FS, { suffix: unitText })
    if (box) {
      // Away from whichever side from this corner runs closest to the height.
      const down = mul(up, -1)
      const [near] = [pts[a], pts[b]].map((e) => unit(sub(e, pts[v]))).sort((p, q) => dot(q, down) - dot(p, down))
      let across = perp(up)
      if (dot(across, near) > 0) across = mul(across, -1)
      const spot = (d: Vec) => add(mul(add(pts[v], foot), 0.5), mul(d, 6 + reach(box, d)))
      // The other side of the height when this one is crowded (by its corner's angle label, say).
      // It has to fit between the height and the side next to it there.
      const other = spot(mul(across, -1))
      const rel = sub(other, pts[v])
      const fits = Math.abs(rel[0] * near[1] - rel[1] * near[0]) > reach(box, perp(near)) + 3
      if (fits && overlaps(box, spot(across)) && !overlaps(box, other)) across = mul(across, -1)
      place(h, box, spot(across), up, across, 0.4 * len(sub(pts[v], foot)))
    }
    const footBox = s[`${h}Foot`].trim() ? layoutMath(s[`${h}Foot`].trim(), NAME_FS) : null
    if (footBox) {
      const down = mul(up, -1)
      place(`f${v}`, footBox, add(foot, mul(down, 7 + reach(footBox, down))), down, perp(down))
    }
  }

  // The frame holds the triangle, its extensions and every label.
  const points: Vec[] = [...ANGLES.map((v) => pts[v]), ...extensions.flat()]
  for (const l of labels) points.push([l.cx - l.box.w / 2, l.y - l.box.asc], [l.cx + l.box.w / 2, l.y + l.box.desc])
  const minX = Math.min(...points.map((p) => p[0])) - PAD
  const minY = Math.min(...points.map((p) => p[1])) - PAD
  const maxX = Math.max(...points.map((p) => p[0])) + PAD
  const maxY = Math.max(...points.map((p) => p[1])) + PAD

  return {
    frame: { x: r1(minX), y: r1(minY), w: r1(maxX - minX), h: r1(maxY - minY) },
    corners: ANGLES.map((v) => pts[v]),
    arcs,
    squares,
    ticks,
    heights,
    extensions,
    labels,
  }
}
