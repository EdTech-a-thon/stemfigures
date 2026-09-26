// The choices in a row style: how one equation row is drawn. The coordinate
// grid uses all of them; the number line uses only the color and point mark,
// since its thick line, arrows and circles carry meaning.

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
