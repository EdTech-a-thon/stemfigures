// Lays out a number line as plain numbers for NumberLine.svelte to draw. The
// line is always LINE units long, whatever its range, so every figure pastes
// into a worksheet at the same width; the SVG scales to fit wherever it's shown.

import { niceLabel, numberLabel, type Label } from '$lib/shared/numbering.js'
import { readLine, type Settings } from './settings.js'

export const LINE = 600
const FS = 16 // number font size
const PAD = 16
const EXT = 22 // how far the line runs past its last tick, to its arrow
const RAY_EXT = 46 // the same where the graph runs off that end, to fit its arrow too
const RAY_GAP = 15 // from the line's arrow tip back to the graph's
const RAY_HEAD = 17 // length of the graph's arrowhead
const RAY_HALF = 9 // half its width
const TICK = 9 // half height of a numbered tick
const MINOR = 5 // half height of the ticks between numbers
const R = 6.5 // endpoint circle radius
const CHAR = FS * 0.6 // rough width of one digit
const EPS = 1e-9

const labelWidth = (l: Label) => (l.text ?? (l.num!.length > l.den!.length ? l.num : l.den) + l.sign!).length * CHAR

/** A number line laid out for NumberLine.svelte to draw. */
export type LineLayout = ReturnType<typeof buildLine>

/** A number on the line: on one line of text, or a stacked fraction. */
type LineNumber =
  | { x: number; text: string; y: number; sign?: undefined; num?: undefined; den?: undefined }
  | { x: number; sign: string; num: string; den: string; numY: number; barY: number; denY: number; text?: undefined; y?: undefined }

export function buildLine(s: Settings) {
  const { range, numbering, endpointNumbering, set, points, problems } = readLine(s)
  const { from, to, step } = range
  const x = (v: number) => L + ((v - from) / (to - from)) * LINE

  // Ticks, numbering every nth one counting from the tick at 0 when there is
  // one, so "every 5" gives 0, 5, 10…
  const count = Math.floor((to - from) / step + EPS)
  const zero = -from / step
  const z = Math.round(zero)
  const ref = Math.abs(zero - z) < EPS && z >= 0 && z <= count ? z : 0
  const ticks: { v: number; major: boolean; label: Label | null }[] = []
  for (let i = 0; i <= count; i++) {
    const v = from + i * step
    const numbered = !!s.every && (i - ref) % s.every === 0
    ticks.push({ v, major: numbered || !s.every, label: numbered ? numberLabel(v, numbering) : null })
  }

  // Every row's graph, clipped to the line.
  const graph = set
  const endpoints = new Map<number, boolean>() // value -> closed; an endpoint shared by two parts is drawn once
  for (const { lo, hi } of graph) {
    for (const b of [lo, hi]) {
      if (Number.isFinite(b.v) && b.v >= from - EPS && b.v <= to + EPS) endpoints.set(b.v, endpoints.get(b.v) || b.closed)
    }
  }
  // Points are closed dots like x = 3, or crosses.
  const shown = points.filter((v) => v >= from - EPS && v <= to + EPS)
  const crosses = s.points === 'cross' ? shown : []
  if (s.points !== 'cross') for (const v of shown) endpoints.set(v, true)
  // An endpoint without a number under it gets one above it, clear of the tick
  // numbers, so the figure is never ambiguous. It's written the way the
  // equations were typed, so x < π/2 is labeled π/2.
  const onNumber = (v: number) => ticks.some((t) => t.label && Math.abs(t.v - v) < EPS * Math.max(1, Math.abs(v)))
  const extraLabels = [...new Set([...endpoints.keys(), ...crosses])].filter((v) => !onNumber(v)).map((v) => ({ v, label: niceLabel(v, endpointNumbering) }))

  const labels = ticks.filter((t): t is { v: number; major: boolean; label: Label } => !!t.label)
  const stacked = labels.some((l) => l.label.den)
  const extraStacked = extraLabels.some((l) => l.label.den)
  const aboveH = extraLabels.length ? (extraStacked ? FS * 2.3 : FS) + 8 : 0
  const numbersH = labels.length ? (stacked ? FS * 2.3 : FS) + 6 : 0

  // A part of the graph that runs off an end has its own arrow there, before
  // the line's arrow, so the line runs on further at that end to fit both.
  const parts = graph.filter(({ lo, hi }) => lo.v !== hi.v && hi.v >= from - EPS && lo.v <= to + EPS)
  const rayL = parts.some(({ lo }) => lo.v < from - EPS)
  const rayR = parts.some(({ hi }) => hi.v > to + EPS)
  const extL = rayL ? RAY_EXT : EXT
  const extR = rayR ? RAY_EXT : EXT

  const first = labels.find((l) => Math.abs(l.v - from) < EPS * Math.max(1, Math.abs(from)))
  const last = labels.find((l) => Math.abs(l.v - to) < EPS * Math.max(1, Math.abs(to)))
  const L = PAD + Math.max(extL, first ? labelWidth(first.label) / 2 : 0)
  const Rt = PAD + Math.max(extR, last ? labelWidth(last.label) / 2 : 0)
  const T = PAD + aboveH + Math.max(TICK, R + 2)
  const axisY = T
  const height = axisY + TICK + 6 + numbersH + PAD
  const width = L + LINE + Rt

  const ends = { left: L - extL, right: L + LINE + extR }
  const tips = { left: ends.left + RAY_GAP, right: ends.right - RAY_GAP }
  const segments: { x1: number; x2: number }[] = []
  for (const { lo, hi } of parts) {
    const x1 = lo.v < from - EPS ? tips.left + RAY_HEAD - 1 : x(lo.v)
    const x2 = hi.v > to + EPS ? tips.right - RAY_HEAD + 1 : x(hi.v)
    if (x2 > x1) segments.push({ x1, x2 })
  }
  const arrow = (tip: number, dir: number) => `M${tip},${axisY} L${tip - dir * RAY_HEAD},${axisY - RAY_HALF} L${tip - dir * RAY_HEAD},${axisY + RAY_HALF} z`
  const arrows = [rayL && arrow(tips.left, -1), rayR && arrow(tips.right, 1)].filter((a): a is string => !!a)

  // Numbers sit in a row starting at `top`; a row with any stacked fraction is taller.
  const row = (list: { v: number; label: Label }[], top: number, tall: boolean) =>
    list.map(({ v, label }): LineNumber =>
      label.den
        ? { x: x(v), sign: label.sign, num: label.num, den: label.den, numY: top + FS * 0.85, barY: top + FS * 1.1, denY: top + FS * 2.05 }
        : { x: x(v), text: label.text!, y: tall ? top + FS * 1.45 : top + FS * 0.85 },
    )
  const numbers = [
    ...row(labels, axisY + TICK + 6, stacked),
    ...row(extraLabels, axisY - Math.max(TICK, R + 2) - aboveH + 2, extraStacked),
  ]

  return {
    width,
    height,
    fs: FS,
    r: R,
    axis: { x1: ends.left, x2: ends.right, y: axisY },
    // A cross replaces the tick it sits on, which would otherwise turn it into a star.
    ticks: ticks
      .filter((t) => !crosses.some((v) => Math.abs(t.v - v) < EPS * Math.max(1, Math.abs(v))))
      .map((t) => ({ x: x(t.v), y1: axisY - (t.major ? TICK : MINOR), y2: axisY + (t.major ? TICK : MINOR) })),
    numbers,
    segments,
    arrows,
    endpoints: [...endpoints].map(([v, closed]) => ({ x: x(v), closed })),
    crosses: crosses.map((v) => x(v)),
    problems,
  }
}
