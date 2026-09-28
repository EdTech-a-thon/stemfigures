// A ruler's scale, what counts as a reading on it, and where things sit on
// the drawing: a flat ruler with its marks along the top edge, numbered from
// 0 a little in from its left end, and an object lying along that edge.

export const SYSTEMS = ['metric', 'imperial'] as const
export type System = (typeof SYSTEMS)[number]

export const SYSTEM_NAMES: Record<System, string> = { metric: 'Metric (cm)', imperial: 'Imperial (in)' }
export const UNITS: Record<System, string> = { metric: 'cm', imperial: 'in' }

export const CM_SIZES = ['10', '15', '20', '30'] as const
export type CmSize = (typeof CM_SIZES)[number]
export const INCH_SIZES = ['6', '12'] as const
export type InchSize = (typeof INCH_SIZES)[number]

/** A metric ruler's smallest marks. */
export const METRIC_MARKS = ['cm', 'half', 'mm'] as const
export type MetricMarks = (typeof METRIC_MARKS)[number]
export const METRIC_MARK_NAMES: Record<MetricMarks, string> = { cm: '1 cm', half: '0.5 cm', mm: '1 mm' }
const METRIC_MINOR: Record<MetricMarks, number> = { cm: 1, half: 0.5, mm: 0.1 }

/** An imperial ruler's marks per inch. */
export const IMPERIAL_MARKS = ['2', '4', '8', '16'] as const
export type ImperialMarks = (typeof IMPERIAL_MARKS)[number]

/** How far a metric reading goes: one estimated digit past the smallest
 *  mark, as in the other reading figures, or to the nearest mark. Imperial
 *  readings are always to the nearest mark, as a fraction. */
export const READS = ['estimate', 'mark'] as const
export type Read = (typeof READS)[number]
export const READ_NAMES: Record<Read, string> = { estimate: 'One estimated digit', mark: 'Nearest mark' }

export interface RulerChoice {
  system: System
  cm: CmSize
  inches: InchSize
  metricMarks: MetricMarks
  imperialMarks: ImperialMarks
  read: Read
}

export interface RulerScale {
  system: System
  /** the scale's length from 0, in cm or inches */
  size: number
  /** the distance between the smallest marks */
  minor: number
  /** what a reading is rounded to */
  step: number
  /** decimal places in a metric reading; an imperial one is a fraction */
  decimals: number
}

export function rulerScale(c: RulerChoice): RulerScale {
  if (c.system === 'imperial') {
    const minor = 1 / Number(c.imperialMarks)
    return { system: c.system, size: Number(c.inches), minor, step: minor, decimals: 0 }
  }
  const minor = METRIC_MINOR[c.metricMarks]
  const estimate = c.read === 'estimate'
  // 1 cm and 0.5 cm marks are both estimated to 0.1 cm; 1 mm marks to 0.01.
  const step = estimate ? (minor < 0.5 ? minor / 10 : 0.1) : minor
  const decimals = Math.max(0, Math.round(-Math.log10(step) + 0.3))
  return { system: c.system, size: Number(c.cm), minor, step, decimals }
}

/** The shortest object worth measuring. */
export const shortest = (scale: RulerScale) => Math.max(scale.step, scale.system === 'metric' ? 0.5 : 0.25)

/** `value` rounded to what the ruler reads, and kept between `min` and `max`. */
export function snap(scale: RulerScale, value: number, min = 0, max = scale.size) {
  const clamped = Math.min(max, Math.max(min, value))
  const steps = Math.round(clamped / scale.step + 1e-9)
  // Back inside the range when rounding pushed it over.
  const n = steps * scale.step > max + 1e-9 ? steps - 1 : steps * scale.step < min - 1e-9 ? steps + 1 : steps
  return Number((n * scale.step).toFixed(6))
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/** A reading as written: "4.37" in cm; "3 3/8", "1/4" or "6" in inches. */
export function formatLength(scale: RulerScale, value: number) {
  if (scale.system === 'metric') return value.toFixed(scale.decimals)
  const n = Math.round(1 / scale.step)
  const parts = Math.round(value * n)
  const whole = Math.floor(parts / n)
  const rest = parts % n
  if (!rest) return String(whole)
  const d = gcd(rest, n)
  const fraction = `${rest / d}/${n / d}`
  return whole ? `${whole} ${fraction}` : fraction
}

/** The number in what a teacher types: a decimal, or in inches also a
 *  fraction or mixed number such as "27/8", "3 3/8" or "3-3/8". */
export function parseLength(text: string): number | undefined {
  const t = text.trim()
  const decimal = /^\d*\.?\d+$|^\d+\.$/
  if (decimal.test(t)) return Number(t)
  const m = /^(?:(\d+)(?:\s+|\s*-\s*|\s*\+\s*))?(\d+)\s*\/\s*(\d+)$/.exec(t)
  if (!m || Number(m[3]) === 0) return undefined
  return Number(m[1] ?? 0) + Number(m[2]) / Number(m[3])
}

/** A length the teacher might set: between a sixth and two thirds of the ruler. */
export function randomLength(scale: RulerScale, random: () => number = Math.random) {
  const [low, high] = [Math.max(shortest(scale), scale.size / 6), (scale.size * 2) / 3]
  return snap(scale, low + random() * (high - low))
}

export interface Tick {
  value: number
  /** 0 for a numbered mark, then 1, 2… for ever shorter marks */
  level: number
  label?: string
}

/** Every mark on the ruler: numbered each cm or inch, with a medium mark
 *  at each half centimeter among millimeters, and inch marks shortening
 *  from halves down to sixteenths. */
export function rulerTicks(scale: RulerScale): Tick[] {
  const perUnit = Math.round(1 / scale.minor)
  const count = Math.round(scale.size * perUnit)
  const ticks: Tick[] = []
  for (let i = 0; i <= count; i++) {
    const value = Number((i * scale.minor).toFixed(6))
    const j = i % perUnit
    if (!j) {
      ticks.push({ value, level: 0, label: String(value) })
      continue
    }
    const level =
      scale.system === 'imperial' ? Math.round(Math.log2(perUnit / gcd(j, perUnit))) : perUnit === 10 && j !== 5 ? 2 : 1
    ticks.push({ value, level })
  }
  return ticks
}

/** Drawing units per centimeter, the same whatever the ruler, so a longer
 *  ruler makes a wider figure and an object is the same size on any. */
export const PER_CM = 32
const PER_UNIT: Record<System, number> = { metric: PER_CM, imperial: 2.54 * PER_CM }

/** The ruler in its own units: its top left corner at (0, 0), marked along
 *  its top edge. */
export function rulerGeometry(scale: RulerScale) {
  const perUnit = PER_UNIT[scale.system]
  /** unmarked ruler before 0 and past the last mark */
  const end = 22
  const height = 84
  const tickHeights = scale.system === 'imperial' ? [0.36, 0.28, 0.22, 0.16, 0.11] : [0.36, 0.26, 0.17]
  return {
    perUnit,
    end,
    height,
    width: 2 * end + scale.size * perUnit,
    xOf: (v: number) => end + v * perUnit,
    tickHeight: (level: number) => height * tickHeights[Math.min(level, tickHeights.length - 1)],
  }
}

export type RulerGeometry = ReturnType<typeof rulerGeometry>

/** What a figure's ruler is called, e.g. "15 cm ruler marked in millimeters"
 *  or "6 in ruler marked in eighths of an inch". */
export function rulerName(scale: RulerScale) {
  const inch: Record<number, string> = { 2: 'half inches', 4: 'quarter inches', 8: 'eighths of an inch', 16: 'sixteenths of an inch' }
  const cm: Record<number, string> = { 1: 'centimeters', 2: 'half centimeters', 10: 'millimeters' }
  const perUnit = Math.round(1 / scale.minor)
  const marks = (scale.system === 'imperial' ? inch : cm)[perUnit]
  return `${scale.size} ${UNITS[scale.system]} ruler marked in ${marks}`
}

/** The ruler of the other system nearest in length: the shortest one that
 *  still reaches `needed` (in that system's units), else the longest. */
export function nearestSize<S extends string>(sizes: readonly S[], needed: number): S {
  return sizes.find((s) => Number(s) >= needed - 1e-9) ?? sizes[sizes.length - 1]
}

export const CM_PER_INCH = 2.54
