// Reading what a teacher types to graph on a coordinate grid, with Caret (see
// docs/adr/0002-caret-for-math-input.md): a straight line like y = 2x + 1,
// 2x + 3y = 6 or x = 4, a curve that can be solved for y like y = x^2 - 4 or
// y = 2^x, or points like (2, 3) or (1, 2), (3, 4). Not yet: sideways curves,
// circles and shaded inequalities. Runs on the server too.

import type { TreeNode } from '@caret-js/core'
import { CommaListNode, ComparisonNode, ParenthesesChildTag, VariableNode } from '@caret-js/math'
import { fromText, parsers } from '$lib/shared/math.js'
import { fmt } from '$lib/shared/numbering.js'
import { divisors, evaluate } from './evaluate.js'

const EXAMPLE = 'Try a line like y = 2x + 1, a curve like y = x^2 − 4, a point like (2, 3), or a list of points like (2, 3), (1, 4).'
const EPS = 1e-9

class ReadError extends Error {}

/** How a row is drawn. Colors print well in color and read as distinct in gray. */
export const COLORS = {
  black: '#111827',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#15803d',
  orange: '#ea580c',
  purple: '#7c3aed',
}
export const LINE_STYLES = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' }
// Which ends of a line get an arrowhead. "left" is the end with the smaller x
// (the bottom, for an up-and-down line).
export const ARROWS = { both: 'Both ends', none: 'No arrows', left: 'Left end', right: 'Right end' }
// How points are marked: a dot, or a cross as in France.
export const POINT_STYLES = { dot: 'Dot', cross: 'Cross' }

export type Color = keyof typeof COLORS
export type LineStyle = keyof typeof LINE_STYLES
export type Arrows = keyof typeof ARROWS
export type PointStyle = keyof typeof POINT_STYLES
/** One equation row: what's typed, and how it's drawn. */
export type Row = { text: string; color: Color; line: LineStyle; arrows: Arrows; point: PointStyle }

export const ROW_DEFAULTS: Row = { text: '', color: 'black', line: 'solid', arrows: 'both', point: 'dot' }

const STYLE_KEYS = { color: COLORS, line: LINE_STYLES, arrows: ARROWS, point: POINT_STYLES }
type StyleKey = keyof typeof STYLE_KEYS

/** A point, in the grid's own values. */
export type Point = { x: number; y: number }
/** The line a·x + b·y + c = 0. */
export type Line = { a: number; b: number; c: number }
/** The stretch of values a grid covers. */
export type Box = { x0: number; x1: number; y0: number; y1: number }
/** Part of a line or curve inside the grid, left to right, and whether each end leaves through the grid's edge. */
export type Run = { points: Point[]; edges: [boolean, boolean] }
/** An open or closed circle on a graphed line: a hole, or an endpoint. */
export type Circle = Point & { closed: boolean }
/** y = f(x), and the parts of it that divide by something with x in it (see divisors()). */
export type Curve = { f: (x: number) => number | null; divisors: ((x: number) => number | null)[] }
/** One row, read: what it draws, or a problem for the settings panel. */
export type ReadRow =
  | { problem: string; runs?: undefined; points?: undefined; circles?: undefined }
  | { runs: Run[]; circles: Circle[]; problem?: undefined; points?: undefined }
  | { points: Point[]; problem: string | null; runs?: undefined; circles?: undefined }

/** A row from a form, a stored preset or an older link (just its text). */
export function cleanRow(r: any): Row {
  if (typeof r !== 'object' || r === null) return { ...ROW_DEFAULTS, text: String(r ?? '') }
  const out: Row = { ...ROW_DEFAULTS, text: String(r.text ?? '') }
  for (const [k, list] of Object.entries(STYLE_KEYS) as [StyleKey, object][]) if (r[k] in list) (out as Record<StyleKey, string>)[k] = r[k]
  return out
}

/** A row as one value in the page address: "y=2x+1", or "y=2x+1|color=red|line=dashed". */
export function rowToParam(r: Row): string {
  const style = (Object.keys(STYLE_KEYS) as StyleKey[]).filter((k) => r[k] !== ROW_DEFAULTS[k]).map((k) => `${k}=${r[k]}`)
  return [r.text.trim(), ...style].join('|')
}

export function rowFromParam(value: string): Row {
  const [text, ...style] = String(value).split('|')
  return cleanRow({ text, ...Object.fromEntries(style.map((kv) => kv.split('='))) })
}

/** A bracketed pair like (2, 3) as { x, y }. */
function point(node: TreeNode): Point {
  if (!(node instanceof CommaListNode && node.hasTag(ParenthesesChildTag) && node.expressions.length === 2)) {
    throw new ReadError('Write each point as (x, y), like (2, 3). For more than one, put commas between them: (2, 3), (1, 4).')
  }
  const [x, y] = node.expressions.map((n) => evaluate(n))
  if (x === null || y === null || !Number.isFinite(x) || !Number.isFinite(y)) {
    throw new ReadError('Each point needs two numbers, like (2, 3) or (−1/2, 4). For more than one: (2, 3), (1, 4).')
  }
  return { x, y }
}

/** Is v close enough to w, relative to their size? */
const near = (v: number, w: number) => Math.abs(v - w) <= 1e-7 * Math.max(1, Math.abs(v), Math.abs(w))
// Where an equation is tested for its shape: spread out, and off the usual integers.
const XS = [-7.3, -3.7, -1.2, 0.4, 1.9, 2.9, 5.3, 8.6]

/**
 * An equation in x and y, as the line a·x + b·y + c = 0 when it is one, or else
 * as y = f(x) when y appears only to the first power (y = x² − 4, 2y = 2^x).
 * Both sides are evaluated at test points to see which, so any way of writing
 * it works: y − 3 = (x − 1)², for one.
 */
function graphOf(node: ComparisonNode): { line: Line; curve?: undefined } | { curve: Curve; line?: undefined } {
  if (node.operators.length > 1) throw new ReadError('Use one = sign, like y = 2x + 1.')
  if (node.operators[0] !== '=') throw new ReadError('Shading inequalities isn’t here yet. Try an equation like y = 2x + 1.')
  for (const n of node.traverse()) {
    if (n instanceof VariableNode && n.name !== 'x' && n.name !== 'y') throw new ReadError(`Use x and y, not ${n.name}.`)
  }
  const [left, right] = node.operands
  const F = (x: number, y: number) => {
    const l = evaluate(left, { x, y })
    const r = evaluate(right, { x, y })
    return l === null || r === null || !Number.isFinite(l) || !Number.isFinite(r) ? null : l - r
  }

  // A straight line: F is a·x + b·y + c everywhere. One that divides by
  // something with x in it, like y = (x² − 1)/(x − 1), is drawn as a curve,
  // which knows about holes.
  const divs = [...divisors(left), ...divisors(right)]
  const c = divs.length ? null : F(0, 0)
  // (F(1, 0) and F(0, 1) are checked before a and b are used.)
  const a = c === null ? null : F(1, 0)! - c
  const b = c === null ? null : F(0, 1)! - c
  const linear =
    c !== null && F(1, 0) !== null && F(0, 1) !== null &&
    [[2, -3], [-1.5, 4.25], [7, 11], [-6.2, -2.7]].every(([x, y]) => {
      const v = F(x, y)
      return v !== null && near(v, a! * x + b! * y + c)
    })
  if (linear) {
    if (Math.abs(a!) < 1e-12 && Math.abs(b!) < 1e-12) {
      throw new ReadError(Math.abs(c!) < 1e-12 ? 'That’s true for every point, so there’s nothing to draw.' : 'That’s never true, so there’s nothing to draw.')
    }
    return { line: { a: a!, b: b!, c: c! } }
  }

  // A curve y = f(x): at each x, F is A·y + B, so y = −B / A.
  let tested = 0
  let slope = false
  for (const x of XS) {
    const B = F(x, 0)
    const A1 = F(x, 1)
    if (B === null || A1 === null) continue
    const A = A1 - B
    for (const y of [2, -3.5, 6.25]) {
      const v = F(x, y)
      if (v === null) continue
      tested++
      if (!near(v, A * y + B)) throw new ReadError('Sideways curves and circles aren’t here yet. Try one you can write as y = …, like y = x^2 − 4.')
    }
    if (Math.abs(A) > 1e-12) slope = true
  }
  if (!tested) throw new ReadError(EXAMPLE)
  if (!slope) throw new ReadError('Write it with y, like y = x^2 − 4. An equation in x alone, like x^2 = 4, isn’t here yet.')
  const A = (x: number) => {
    const B = F(x, 0)
    const A1 = F(x, 1)
    return B === null || A1 === null ? null : A1 - B
  }
  return {
    curve: {
      f: (x) => {
        const B = F(x, 0)
        const A1 = F(x, 1)
        if (B === null || A1 === null || Math.abs(A1 - B) < 1e-12) return null
        return -B / (A1 - B)
      },
      // Solving for y divides by y's coefficient too: y(x − 1) = x² − 1.
      divisors: [...divs, A],
    },
  }
}

/**
 * Read one row. Blank text draws nothing.
 */
export function parseEquation(
  text: string,
): { line?: Line; curve?: Curve; points?: Point[]; error?: string } | null {
  if (!String(text ?? '').trim()) return null
  try {
    const node = parsers.equation.parse(fromText(text))
    if (node instanceof ComparisonNode) return graphOf(node)
    if (node instanceof CommaListNode) {
      const items = node.hasTag(ParenthesesChildTag) ? [node] : node.expressions
      return { points: items.map(point) }
    }
    throw new ReadError(EXAMPLE)
  } catch (e) {
    if (e instanceof ReadError) return { error: e.message }
    throw e
  }
}

/**
 * The line a·x + b·y + c = 0 clipped to a box of values, as its two ends, or
 * null when it misses the box.
 */
export function clipLine({ a, b, c }: Line, box: Box): [Point, Point] | null {
  // Walk along the line from a point on it: p + t·d, d = (b, −a).
  const p: Point = Math.abs(b) > Math.abs(a) ? { x: 0, y: -c / b } : { x: -c / a, y: 0 }
  const d: Point = { x: b, y: -a }
  let lo = -Infinity
  let hi = Infinity
  for (const [k, min, max] of [['x', box.x0, box.x1], ['y', box.y0, box.y1]] as const) {
    if (Math.abs(d[k]) < 1e-12) {
      if (p[k] < min - 1e-9 || p[k] > max + 1e-9) return null
      continue
    }
    const [t1, t2] = [(min - p[k]) / d[k], (max - p[k]) / d[k]].sort((m, n) => m - n)
    lo = Math.max(lo, t1)
    hi = Math.min(hi, t2)
  }
  if (!(hi - lo > 1e-9)) return null
  const at = (t: number): Point => ({ x: p.x + t * d.x, y: p.y + t * d.y })
  return [at(lo), at(hi)]
}

const inBox = ({ x, y }: Point, box: Box) => x >= box.x0 - EPS && x <= box.x1 + EPS && y >= box.y0 - EPS && y <= box.y1 + EPS

/** Left end first; for an up-and-down line, the bottom. */
const leftFirst = (p: Point, q: Point) => (Math.abs(p.x - q.x) > EPS ? p.x < q.x : p.y < q.y)

/** Where g is 0 between a and b: where it changes sign, and where it touches 0 without crossing, like (x − 1)². */
function zerosOf(g: (x: number) => number | null, a: number, b: number, n = 960): number[] {
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)
  const vs = xs.map((x) => {
    const v = g(x)
    return v === null || !Number.isFinite(v) ? null : v
  })
  const scale = Math.max(1, ...vs.map((v) => Math.abs(v ?? 0)))
  const out: number[] = []
  const bisect = (lo: number, hi: number, glo: number) => {
    for (let k = 0; k < 80; k++) {
      const m = (lo + hi) / 2
      const gm = g(m)
      if (gm === null || gm === 0) return m
      if (Math.sign(gm) === Math.sign(glo)) [lo, glo] = [m, gm]
      else hi = m
    }
    return (lo + hi) / 2
  }
  for (let i = 0; i <= n; i++) {
    const v = vs[i]
    if (v === null) continue
    const [before, after] = [vs[i - 1] ?? null, vs[i + 1] ?? null]
    if (v === 0) out.push(xs[i])
    else if (after !== null && after !== 0 && Math.sign(after) !== Math.sign(v)) out.push(bisect(xs[i], xs[i + 1], v))
    else if (before !== null && after !== null && Math.abs(v) < Math.abs(before) && Math.abs(v) <= Math.abs(after)) {
      // A dip toward 0: find its bottom, and keep it if it gets there.
      let [lo, hi] = [xs[i - 1], xs[i + 1]]
      for (let k = 0; k < 100; k++) {
        const [m1, m2] = [lo + (hi - lo) / 3, hi - (hi - lo) / 3]
        const [g1, g2] = [g(m1), g(m2)]
        if (g1 === null || g2 === null) break
        if (Math.abs(g1) < Math.abs(g2)) hi = m2
        else lo = m1
      }
      const m = (lo + hi) / 2
      const gm = g(m)
      if (gm !== null && Math.abs(gm) < 1e-9 * scale) out.push(m)
    }
  }
  return out
}

/**
 * Where y = f(x) breaks inside the box's x-values, found where something it
 * divides by is 0: holes, where the curve carries on across one missing
 * point (drawn as an open circle), and asymptotes and jumps, where it doesn't.
 */
export function breaksOf(curve: Curve, box: Box): { holes: Point[]; at: number[] } {
  const { f } = curve
  const w = box.x1 - box.x0
  const h = box.y1 - box.y0
  const found: number[] = []
  for (const g of curve.divisors) {
    for (const r of zerosOf(g, box.x0, box.x1)) if (!found.some((q) => Math.abs(q - r) < w * 1e-9)) found.push(r)
  }
  const holes: Point[] = []
  const at: number[] = []
  const d = w * 1e-7
  // Blows up toward r from one side: an asymptote.
  const blows = (v: number | null, farther: number | null) => v !== null && farther !== null && Math.abs(v) > h && Math.abs(v) > 3 * Math.abs(farther)
  for (const r of found.sort((p, q) => p - q)) {
    const [l, rt] = [f(r - d), f(r + d)]
    if (blows(l, f(r - 10 * d)) || blows(rt, f(r + 10 * d))) at.push(r)
    // Dividing by 0 leaves it undefined at r, even where the curve carries on
    // across (and r is only found to within rounding, so f(r) may not say so).
    else if (l !== null && rt !== null && Math.abs(l - rt) < h * 1e-4) {
      at.push(r)
      holes.push({ x: r, y: (l + rt) / 2 })
    } else if (l !== null || rt !== null) at.push(r)
  }
  return { holes: holes.filter((p) => inBox(p, box)), at }
}

/**
 * The parts of y = f(x) inside the box, each left to right, with whether each
 * end leaves through the box's edge (where an arrow goes) rather than stopping
 * where f does (like √x at 0). Sampled finely enough to draw smoothly, and
 * never joined across a break: one given (an asymptote, a hole or a jump), or
 * one found between two neighboring samples that stay far apart however
 * closely they're looked at.
 */
export function curveRuns(f: (x: number) => number | null, box: Box, breaks: number[] = [], samples = 480): Run[] {
  type Sample = { x: number; y: number | null; in: boolean; brk?: boolean }
  const w = box.x1 - box.x0
  const h = box.y1 - box.y0
  const value = (x: number) => {
    const y = f(x)
    return y === null || !Number.isFinite(y) ? null : y
  }
  const inside = (y: number | null) => y !== null && y >= box.y0 - EPS && y <= box.y1 + EPS
  const sample = (x: number, brk = false): Sample => {
    const y = value(x)
    return { x, y, in: inside(y), brk }
  }

  const uniform = Array.from({ length: samples + 1 }, (_, i) => sample(box.x0 + (w * i) / samples))
  const all = [...breaks]
  for (let i = 0; i < samples; i++) {
    let [ya, yb] = [uniform[i].y, uniform[i + 1].y]
    if (ya === null || yb === null || Math.abs(yb - ya) <= h) continue
    // Keep the half that jumps more: a steep curve's jump shrinks, a break's doesn't.
    let [lo, hi] = [uniform[i].x, uniform[i + 1].x]
    let brk: number | null = null
    for (let k = 0; k < 60 && Math.abs(yb - ya) >= h * 1e-3; k++) {
      const m = (lo + hi) / 2
      const ym = value(m)
      if (ym === null) {
        brk = m
        break
      }
      if (Math.abs(ym - ya) >= Math.abs(yb - ym)) [hi, yb] = [m, ym]
      else [lo, ya] = [m, ym]
    }
    if (brk === null && Math.abs(yb - ya) >= h * 1e-3) brk = (lo + hi) / 2
    if (brk !== null && !all.some((b) => Math.abs(b - brk!) < w * 1e-6)) all.push(brk)
  }

  // Each break is looked at just either side, and the far side isn't joined to the near one.
  const d = w * 1e-9
  const pts = [...uniform]
  for (const b of all) if (b > box.x0 && b < box.x1) pts.push(sample(b - d), sample(b + d, true))
  pts.sort((p, q) => p.x - q.x)

  // Where the curve crosses the top or bottom between an inside and an outside sample.
  const crossing = (a: Sample & { y: number }, b: Sample & { y: number }): Point => {
    const edge = b.y > box.y1 || a.y > box.y1 ? box.y1 : box.y0
    let [lo, hi] = [{ x: a.x, y: a.y }, { x: b.x, y: b.y }]
    for (let k = 0; k < 50; k++) {
      const x = (lo.x + hi.x) / 2
      const y = value(x)
      if (y === null) break
      if ((y - edge) * (a.y - edge) > 0) lo = { x, y }
      else hi = { x, y }
    }
    const t = (edge - lo.y) / (hi.y - lo.y)
    return { x: lo.x + (Number.isFinite(t) ? t : 0) * (hi.x - lo.x), y: edge }
  }

  const runs: Run[] = []
  let run: Run | null = null
  let prev: Sample | null = null
  for (const s of pts) {
    const joined = prev !== null && !s.brk
    if (s.in && (!joined || !prev!.in)) {
      // Coming in: from the left edge, across the top or bottom, or where f starts.
      run = { points: [], edges: [prev === null || (joined && prev.y !== null), false] }
      if (joined && prev!.y !== null) run.points.push(crossing(prev as Sample & { y: number }, s as Sample & { y: number }))
      runs.push(run)
    }
    if (s.in) run!.points.push({ x: s.x, y: s.y! })
    else if (prev?.in) {
      // Going out: across the top or bottom, or where f stops.
      if (joined && s.y !== null) run!.points.push(crossing(prev as Sample & { y: number }, s as Sample & { y: number }))
      run!.edges[1] = joined && s.y !== null
    }
    prev = s
  }
  if (prev?.in) run!.edges[1] = true // out the right edge
  return runs.filter((r) => r.points.length > 1)
}

/**
 * Every row, read and fitted to the grid's box of values: the parts of a line
 * or curve inside the grid (runs), the points on it, and a problem for the
 * settings panel when a row can't be read or doesn't show.
 */
export function readEquations(texts: string[], box: Box): (ReadRow | null)[] {
  return texts.map((text): ReadRow | null => {
    const read = parseEquation(text)
    if (!read) return null
    if (read.error) return { problem: read.error }
    if (read.line || read.curve) {
      let runs: Run[] = []
      let circles: Circle[] = []
      if (read.line) {
        const ends = clipLine(read.line, box)
        if (ends) runs = [{ points: leftFirst(...ends) ? ends : [ends[1], ends[0]], edges: [true, true] }]
      } else {
        const { holes, at } = breaksOf(read.curve!, box)
        runs = curveRuns(read.curve!.f, box, at)
        circles = holes.map((p) => ({ ...p, closed: false }))
      }
      return runs.length ? { runs, circles } : { problem: 'That graph misses the grid. Widen the axes to show it.' }
    }
    const off = read.points!.find((pt) => !inBox(pt, box))
    return {
      points: read.points!.filter((pt) => inBox(pt, box)),
      problem: off ? `(${fmt(off.x)}, ${fmt(off.y)}) is off the grid. Widen the axes to show it.` : null,
    }
  })
}
