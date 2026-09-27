// Putting a figure's labels down one at a time without overlapping. A label
// the teacher drags keeps its offset in its part's own directions (along and
// across a side, say), so it follows the part when the figure is reshaped;
// those offsets travel in the page address as "AB:4,-6;vC:0,3".

import type { MathBox } from './mathSvg.js'
import { add, mul, type Vec } from './vec.js'

/** A dragged label's offset: along and across its part. */
export type Offset = [number, number]

/** A label placed on a figure. `part` is what it labels, such as "AB". */
export type PlacedLabel = { part: string; box: MathBox; cx: number; cy: number; x: number; y: number; along: Vec; across: Vec; offset: Offset }

/** Dragged labels, as { part: [along, across] }. */
export function readMoved(text: string): Record<string, Offset> {
  const out: Record<string, Offset> = {}
  for (const item of String(text ?? '').split(';')) {
    const m = item.match(/^([A-Za-z0-9]+):(-?[\d.]+),(-?[\d.]+)$/)
    if (m && (Number(m[2]) || Number(m[3]))) out[m[1]] = [Number(m[2]), Number(m[3])]
  }
  return out
}

export function writeMoved(moved: Record<string, Offset>): string {
  const r = (v: number) => String(Math.round(v))
  return Object.entries(moved)
    .filter(([, [x, y]]) => Math.round(x) || Math.round(y))
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, [x, y]]) => `${k}:${r(x)},${r(y)}`)
    .join(';')
}

/** The labels placed so far, and how to place the next. `moved` is the setting. */
export function labelPlacer(moved: string) {
  const offsets = readMoved(moved)
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
    const o = offsets[part] ?? [0, 0]
    const [cx, cy] = add(center, add(mul(along, o[0]), mul(across, o[1])))
    labels.push({ part, box, cx, cy, x: cx - box.w / 2, y: cy + (box.asc - box.desc) / 2, along, across, offset: o })
  }
  return { labels, overlaps, place }
}
