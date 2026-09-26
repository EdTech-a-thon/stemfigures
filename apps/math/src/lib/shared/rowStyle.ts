// The choices in a row style: how one equation row is drawn. The coordinate
// grid uses all of them; point names, endpoints and asymptotes are its own.
// The number line uses only the color and point mark, since its thick line,
// arrows and circles carry meaning.

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
// What's written beside a named point: its name (A), or its name and coordinates (A(1, 2)).
export const NAME_STYLES = { name: 'Name', coords: 'Name and coordinates' }
// Whether a line with a domain shows open and closed circles at its ends, or just stops.
export const ENDPOINTS = { shown: 'Show endpoints', hidden: 'No endpoints' }
// Whether a curve's asymptotes are drawn as dotted lines. Hidden unless asked, so a test can ask for them.
export const ASYMPTOTES = { hidden: 'No asymptotes', shown: 'Show asymptotes' }

export type Color = keyof typeof COLORS
export type LineStyle = keyof typeof LINE_STYLES
export type Arrows = keyof typeof ARROWS
export type PointStyle = keyof typeof POINT_STYLES
export type NameStyle = keyof typeof NAME_STYLES
export type Endpoints = keyof typeof ENDPOINTS
export type AsymptoteStyle = keyof typeof ASYMPTOTES
