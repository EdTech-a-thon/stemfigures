// Where everything in an orbital diagram figure goes: the symbol on the left,
// the noble gas core and sublevels in rows that wrap between sublevels, the
// sublevel labels under their orbitals and the configuration line under it
// all. Text widths are estimated, since the server can't measure text.

import type { Diagram } from './diagram'
import type { OrbitalStyle, TextMode } from './settings'

/** An orbital square's side, and a line orbital's width. */
export const ORBITAL = 34
/** Space between line orbitals in one sublevel (squares touch). */
export const LINE_GAP = 6
export const SUBLEVEL_GAP = 18
/** The widest a row of orbitals gets before wrapping. */
export const MAX_ROW = 600
export const LABEL_SIZE = 16
export const SYMBOL_SIZE = 28
export const CORE_SIZE = 22
export const CONFIG_SIZE = 20
export const ANSWER_SIZE = 18
/** A superscript's size as a share of its text's. */
export const SUPERSCRIPT = 0.62

const LABEL_ROOM = 26
const ROW_SPACING = 18
const SYMBOL_GAP = 22
const CORE_GAP = 12
const CONFIG_GAP = 16
const SYMBOL_BLANK = 64
const LABEL_BLANK = 30
const CONFIG_BLANK = 300

/** Roughly how wide Arial draws text, in ems per character. */
function charWidth(c: string) {
  if (/[ il.,:;'’|!]/.test(c)) return 0.28
  if (/[[\]()fjrt]/.test(c)) return 0.33
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/.test(c)) return 0.4
  if (/[mwMW]/.test(c)) return 0.83
  if (/[A-Z]/.test(c)) return 0.68
  return 0.56
}

export const textWidth = (text: string, size: number) => [...text].reduce((w, c) => w + charWidth(c) * size, 0)

/** A piece of text with superscripts, e.g. "4s" then "2". */
export type Run = { text: string; sup?: boolean }

export const runsWidth = (runs: Run[], size: number) =>
  runs.reduce((w, r) => w + textWidth(r.text, r.sup ? size * SUPERSCRIPT : size), 0)

export const sublevelWidth = (orbitals: number, style: OrbitalStyle) =>
  style === 'squares' ? orbitals * ORBITAL : orbitals * ORBITAL + (orbitals - 1) * LINE_GAP

/** The left edge of each orbital in a sublevel, from the sublevel's left. */
export const orbitalOffsets = (orbitals: number, style: OrbitalStyle) =>
  Array.from({ length: orbitals }, (_, i) => i * (ORBITAL + (style === 'squares' ? 0 : LINE_GAP)))

export interface PlacedSublevel {
  name: string
  x: number
  y: number
  width: number
}

export interface FigureLayout {
  width: number
  height: number
  symbol?: { x: number; y: number; width: number }
  core?: { x: number; y: number }
  sublevels: PlacedSublevel[]
  /** the top of each row of orbitals */
  rows: number[]
  config?: { x: number; y: number; width: number }
}

export interface LayoutOptions {
  style: OrbitalStyle
  labels: TextMode
  symbol: TextMode
  /** the symbol as it's drawn, e.g. [{ text: 'Fe' }, { text: '2+', sup: true }] */
  symbolRuns: Run[]
  configLine: TextMode
  configRuns: Run[]
  /** lines printed under the figure, so it's at least as wide as they are */
  answer: string[]
}

export function layoutFigure(diagram: Diagram, o: LayoutOptions): FigureLayout {
  const symbolWidth = o.symbol === 'text' ? runsWidth(o.symbolRuns, SYMBOL_SIZE) : o.symbol === 'blank' ? SYMBOL_BLANK : 0
  const left = symbolWidth ? symbolWidth + SYMBOL_GAP : 0
  const rowHeight = ORBITAL + (o.labels === 'none' ? 0 : LABEL_ROOM)

  // Fill rows left to right, starting a new row before a sublevel that
  // won't fit, never splitting one.
  const sublevels: PlacedSublevel[] = []
  let row = 0
  let x = 0
  let widest = 0
  let core: FigureLayout['core']
  if (diagram.core) {
    core = { x: left, y: 0 }
    x = textWidth(`[${diagram.core}]`, CORE_SIZE) + CORE_GAP
  }
  for (const s of diagram.sublevels) {
    const width = sublevelWidth(s.orbitals.length, o.style)
    if (x > 0 && x + width > MAX_ROW) {
      row++
      x = 0
    }
    sublevels.push({ name: s.name, x: left + x, y: row * (rowHeight + ROW_SPACING), width })
    x += width
    widest = Math.max(widest, x)
    x += SUBLEVEL_GAP
  }
  const rows = Array.from({ length: row + 1 }, (_, i) => i * (rowHeight + ROW_SPACING))
  let height = rows.at(-1)! + rowHeight

  let config: FigureLayout['config']
  if (o.configLine !== 'none') {
    const width = o.configLine === 'text' ? runsWidth(o.configRuns, CONFIG_SIZE) : CONFIG_BLANK
    config = { x: left, y: height + CONFIG_GAP + CONFIG_SIZE, width }
    height = config.y + 6
    widest = Math.max(widest, width)
  }

  const answerWidth = Math.max(0, ...o.answer.map((line) => textWidth(line, ANSWER_SIZE)))
  return {
    width: Math.max(left + widest, answerWidth),
    height,
    symbol: symbolWidth ? { x: 0, y: ORBITAL / 2 + SYMBOL_SIZE * 0.36, width: symbolWidth } : undefined,
    core,
    sublevels,
    rows,
    config,
  }
}

export const labelBlankWidth = (sublevelWidth: number) => Math.min(sublevelWidth, LABEL_BLANK + 10)
export const LABEL_BASELINE = ORBITAL + 20
