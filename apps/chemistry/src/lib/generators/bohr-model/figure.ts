// Everything a Bohr model figure draws, worked out from its settings: the
// model in its square, and the optional key to its right, like a particle
// diagram's (CONTEXT.md "Key").

import { BALL_R, electronRadius, modelSide, rings, textWidth, type Component, type ComponentLook, type Dot, type Ring } from './model'
import { ballsFor, drawnNucleus, type BohrSettings, type NucleusStyle } from './settings'

export const KEY_PAD = 12
const KEY_GAP = 24
const NAME_GAP = 12
export const KEY_FONT = 16
export const KEY_HEADING = 17
const TEXT_H = 20
const LINE_GAP = 10

export const COMPONENT_NAMES: Record<Component, string> = { proton: 'Proton', neutron: 'Neutron', electron: 'Electron' }

export interface KeyLayout {
  width: number
  height: number
  headingY: number
  lines: { dot: Dot; name: string; nameX: number }[]
}

/** The key from (0, 0): one line for each component drawn as a ball or dot. */
export function keyLayout(components: { component: Component; r: number }[]): KeyLayout | undefined {
  if (!components.length) return undefined
  const drawW = 2 * Math.max(...components.map((c) => c.r))
  const nameX = KEY_PAD + drawW + NAME_GAP
  const headingY = KEY_PAD + TEXT_H / 2
  let y = KEY_PAD + TEXT_H + LINE_GAP
  const lines = components.map(({ component, r }) => {
    const lineH = Math.max(2 * r, TEXT_H)
    const dot = { x: KEY_PAD + drawW / 2, y: y + lineH / 2, r, component }
    y += lineH + LINE_GAP
    return { dot, name: COMPONENT_NAMES[component], nameX }
  })
  const names = Math.max(...lines.map((l) => textWidth(l.name, KEY_FONT)))
  return {
    width: Math.ceil(2 * KEY_PAD + Math.max(textWidth('Key', KEY_HEADING), drawW + NAME_GAP + names)),
    height: y - LINE_GAP + KEY_PAD,
    headingY,
    lines,
  }
}

export interface BohrFigure {
  width: number
  height: number
  /** the model's middle */
  cx: number
  cy: number
  nucleus: NucleusStyle
  balls: Dot[]
  rings: Ring[]
  key?: KeyLayout & { x: number; y: number }
}

/** The whole figure for these settings. The model's square depends only on
 *  the shell count, and the key sits to its right, centered on it. */
export function bohrFigure(s: BohrSettings): BohrFigure {
  const side = modelSide(s.electrons.length)
  const nucleus = drawnNucleus(s)
  const withSymbol = !!s.electronSymbol
  const drawnRings = rings(s.emptyRings ? s.electrons.map(() => 0) : s.electrons, s.placement, withSymbol)

  const components: { component: Component; r: number }[] = []
  if (s.key) {
    if (nucleus === 'balls') components.push({ component: 'proton', r: BALL_R }, { component: 'neutron', r: BALL_R })
    if (!s.emptyRings) components.push({ component: 'electron', r: electronRadius(0, 1, withSymbol) })
  }
  const key = keyLayout(components)
  const height = Math.max(side, key?.height ?? 0)
  return {
    width: side + (key ? KEY_GAP + key.width : 0),
    height,
    cx: side / 2,
    cy: height / 2,
    nucleus,
    balls: ballsFor(s),
    rings: drawnRings,
    key: key && { ...key, x: side + KEY_GAP, y: (height - key.height) / 2 },
  }
}

/** Each component's look in these settings. */
export const looks = (s: BohrSettings): Record<Component, ComponentLook> => ({
  proton: { color: s.protonColor, symbol: s.protonSymbol },
  neutron: { color: s.neutronColor, symbol: s.neutronSymbol },
  electron: { color: s.electronColor, symbol: s.electronSymbol },
})
