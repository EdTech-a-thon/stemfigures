// Lays out a coordinate grid as plain numbers for Graph.svelte to draw. Every
// block is a square of CELL units; the SVG scales to fit wherever it's shown.

import { numberText, type Numbering } from '$lib/shared/numbering.js'
import { COLORS, readEquations, type Point } from './equations.js'
import { readAxes, type Settings } from './settings.js'

export const CELL = 32
const FS = 14 // tick-number font size
const PAD = 14
const EXT = 20 // how far an arrowed axis runs past the grid
const CHAR = FS * 0.6 // rough width of one digit
const HEAD = 12 // length of an arrowhead where a graphed line leaves the grid
const HEAD_HALF = 5.5 // half its width

const round = (v: number) => Math.round(v * 100) / 100
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

function ticks(blocks: number, step: number, start: number, every: number, numbering: Numbering) {
  // Count from the line at 0 when there is one, so "every 5" gives 0, 5, 10…
  const zero = -start / step
  const z = Math.round(zero)
  const ref = Math.abs(zero - z) < 1e-9 && z >= 0 && z <= blocks ? z : 0
  const out: { i: number; text: string }[] = []
  if (!every) return out
  for (let i = 0; i <= blocks; i++) {
    if ((i - ref) % every === 0) out.push({ i, text: numberText(start + i * step, numbering) })
  }
  return out
}

/** A coordinate grid laid out for Graph.svelte to draw. */
export type GraphLayout = ReturnType<typeof buildGraph>

type Text = { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
type Segment = { x1: number; y1: number; x2: number; y2: number }

export function buildGraph(settings: Settings) {
  const { x, y } = readAxes(settings)
  const s = { ...settings, xStart: x.start, xStep: x.step, xBlocks: x.blocks, yStart: y.start, yStep: y.step, yBlocks: y.blocks }
  const x0 = s.xStart
  const y0 = s.yStart
  const x1 = x0 + s.xBlocks * s.xStep
  const y1 = y0 + s.yBlocks * s.yStep
  const gridW = s.xBlocks * CELL
  const gridH = s.yBlocks * CELL

  // Axes cross at 0 when 0 is on the grid, otherwise they run along the left and bottom edges.
  const yAxisInside = x0 < 0 && x1 > 0
  const xAxisInside = y0 < 0 && y1 > 0

  const xTicks = ticks(s.xBlocks, s.xStep, x0, s.xEvery, x.numbering)
  const yTicks = ticks(s.yBlocks, s.yStep, y0, s.yEvery, y.numbering)
  // An axis runs a little past the grid wherever it ends in a cap.
  const extL = s.xStartCap === 'none' ? 0 : EXT
  const extR = s.xEndCap === 'none' ? 0 : EXT
  const extB = s.yStartCap === 'none' ? 0 : EXT
  const extT = s.yEndCap === 'none' ? 0 : EXT

  // Titles are written text, a blank write-on line for students, or nothing.
  // The chart title sits on top; axis titles run along the bottom and left.
  // Axis labels (x, y) sit at the arrow tips.
  const title = s.titleMode === 'text' ? s.title.trim() : ''
  const xTitle = s.xTitleMode === 'text' ? s.xTitle.trim() : ''
  const yTitle = s.yTitleMode === 'text' ? s.yTitle.trim() : ''
  const titleBlank = s.titleMode === 'blank'
  const xBlank = s.xTitleMode === 'blank'
  const yBlank = s.yTitleMode === 'blank'
  const titleRow = title || titleBlank
  const xSide = xTitle || xBlank
  const ySide = yTitle || yBlank
  const xLabel = s.xLabelMode === 'text' ? s.xLabel.trim() : ''
  const yLabel = s.yLabelMode === 'text' ? s.yLabel.trim() : ''
  const xTip = !!xLabel
  const yTip = !!yLabel

  const yNumW = !yAxisInside && yTicks.length ? Math.max(...yTicks.map((t) => t.text.length)) * CHAR + 8 : 0
  const xNumH = !xAxisInside && xTicks.length ? FS + 8 : 0
  const lastX = xTicks.at(-1)?.text.length ?? 0

  // Tip labels can be any length; a long y label centered over its axis may
  // need room on either side.
  const TIP_CHAR = FS * 0.75
  const yTipHalf = yTip ? (yLabel.length * TIP_CHAR) / 2 : 0
  const yAxisOffset = yAxisInside ? (-x0 / s.xStep) * CELL : 0
  const yTipGap = Math.max(extT, 10) // keeps the label clear of the top number

  const L = Math.max(PAD + (ySide ? FS * 1.2 + 12 : 0) + Math.max(extL, yNumW), PAD + yTipHalf - yAxisOffset)
  const T = PAD + (titleRow ? FS * 1.6 + 14 : 0) + (yTip ? yTipGap + FS * 1.3 + 4 : extT)
  const R = PAD + Math.max(
    (lastX * CHAR) / 2,
    extR + (xTip ? xLabel.length * TIP_CHAR + 8 : 0),
    yTipHalf - (gridW - yAxisOffset),
  )
  const B = PAD + Math.max(extB, Math.max(xNumH, yAxisInside ? extB : 0) + (xSide ? FS * 1.2 + 14 : 0))

  const axisX = L + yAxisOffset
  const axisY = xAxisInside ? T + gridH + (y0 / s.yStep) * CELL : T + gridH

  // Tick numbers: x below the x-axis, y to the left of the y-axis. Where the
  // axes cross, a shared value is written once (like the "0" in the corner).
  const onYAxis = (i: number) => Math.abs(L + i * CELL - axisX) < 0.5
  const onXAxis = (j: number) => Math.abs(T + gridH - j * CELL - axisY) < 0.5
  const xCross = xTicks.find((t) => onYAxis(t.i))
  const yCross = yTicks.find((t) => onXAxis(t.i))
  const numbers: (Text & { anchor: 'middle' | 'end' })[] = []
  for (const t of xTicks) {
    const x = L + t.i * CELL
    const cross = t === xCross
    numbers.push({ x: cross ? x - 8 : x, y: axisY + FS + 6, text: t.text, anchor: cross ? 'end' : 'middle' })
  }
  for (const t of yTicks) {
    const y = T + gridH - t.i * CELL
    if (t === yCross && xCross && xCross.text === t.text) continue
    numbers.push({ x: axisX - 6, y: t === yCross ? y - 5 : y + FS * 0.35, text: t.text, anchor: 'end' })
  }

  // Titles, axis labels, and write-on lines for any left blank.
  const labels: (Text & { kind: 'title' | 'tip' | 'side'; rotate?: boolean })[] = []
  const blanks: Segment[] = []
  const midX = L + gridW / 2
  const midY = T + gridH / 2
  const titleY = PAD + FS * 1.6
  if (title) labels.push({ x: midX, y: titleY, text: title, kind: 'title' })
  else if (titleBlank) blanks.push({ x1: midX - Math.min(130, gridW / 2), y1: titleY, x2: midX + Math.min(130, gridW / 2), y2: titleY })

  const xSideY = T + gridH + Math.max(xNumH, yAxisInside ? extB : 0) + FS * 1.2 + 6
  if (xTip) labels.push({ x: L + gridW + extR + 6, y: axisY + FS * 0.4, text: xLabel, kind: 'tip', anchor: 'start' })
  if (xTitle) labels.push({ x: midX, y: xSideY, text: xTitle, kind: 'side' })
  else if (xBlank) blanks.push({ x1: midX - Math.min(100, gridW / 2), y1: xSideY, x2: midX + Math.min(100, gridW / 2), y2: xSideY })

  const ySideX = PAD + FS * 0.9
  if (yTip) labels.push({ x: axisX, y: T - yTipGap - 6, text: yLabel, kind: 'tip', anchor: 'middle' })
  if (yTitle) labels.push({ x: ySideX, y: midY, text: yTitle, kind: 'side', rotate: true })
  else if (yBlank) blanks.push({ x1: ySideX, y1: midY - Math.min(100, gridH / 2), x2: ySideX, y2: midY + Math.min(100, gridH / 2) })

  // What the teacher graphed: each line or curve runs to the grid's edge, with
  // an arrowhead where it leaves at the ends the teacher picked; points are dots or crosses.
  const px = ({ x, y }: Point): Point => ({ x: L + ((x - x0) / s.xStep) * CELL, y: T + gridH - ((y - y0) / s.yStep) * CELL })
  const box = { x0, x1, y0, y1 }
  const lines: { d: string; heads: string[]; color: string; dash: string | undefined; cap: 'round' | 'butt'; width: number }[] = []
  const dots: (Point & { color: string; cross: boolean })[] = []
  const rows = settings.equations ?? []
  readEquations(rows.map((r) => r.text), box).forEach((read, i) => {
    const { color, line: style, arrows, point } = rows[i]
    const ink = COLORS[color]
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
        d: pts.map((p, k) => `${k ? 'L' : 'M'}${round(p.x)},${round(p.y)}`).join(''),
        heads,
        color: ink,
        dash: style === 'dashed' ? '9 6' : style === 'dotted' ? '0.01 6' : undefined,
        cap: style === 'dotted' ? 'round' : 'butt',
        width: style === 'dotted' ? 3.2 : 2.5, // round dots look lighter than a solid stroke
      })
    }
    for (const pt of read?.points ?? []) dots.push({ ...px(pt), color: ink, cross: point === 'cross' })
  })

  return {
    width: L + gridW + R,
    height: T + gridH + B,
    fs: FS,
    grid: { x: L, y: T, w: gridW, h: gridH },
    vLines: Array.from({ length: s.xBlocks + 1 }, (_, i) => L + i * CELL),
    hLines: Array.from({ length: s.yBlocks + 1 }, (_, j) => T + j * CELL),
    xAxis: { x1: L - extL, x2: L + gridW + extR, y: axisY },
    yAxis: { y1: T + gridH + extB, y2: T - extT, x: axisX },
    numbers,
    labels,
    blanks,
    lines,
    dots,
  }
}
