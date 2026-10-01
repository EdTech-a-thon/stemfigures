<script lang="ts">
  // A micropipette set to `volume`, its three digit wheels showing it in the
  // window on the handle, drawn at `zoom` (1 for the whole pipette; more
  // inside a magnifier, where lines stay a comfortable weight). In color its
  // red wheels are red; with `decimalLine`, a line across the window marks
  // where they start too, which keeps them clear on a black and white copy.
  import { sizeAt } from '$shared/magnify'
  import { DIGIT_SIZE, WHEEL_H, type PipetteLayout } from './layout'
  import { decimalAfter, digitsFor, type Pipette } from './pipette'

  interface Props {
    p: Pipette
    at: PipetteLayout
    volume: number
    color: boolean
    decimalLine: boolean
    showModel: boolean
    zoom?: number
  }
  let { p, at, volume, color, decimalLine, showModel, zoom = 1 }: Props = $props()

  const k = $derived(sizeAt(zoom))
  const INK = '#111'
  const RED = '#c8102e'
  const TIPS = { clear: '#ffffff', yellow: '#f6cf3f', blue: '#4f8fe6' }

  const digits = $derived(digitsFor(p, volume))
  const line = $derived(decimalLine ? decimalAfter(p) : null)
  const body = $derived(color ? '#e8ebef' : '#fff')
  const accent = $derived(color && p.tip !== 'clear' ? TIPS[p.tip] : color ? '#cfd4db' : '#fff')
  const cx = $derived(at.cx)

  const handle = $derived.by(() => {
    const h = at.handle
    return (
      `M ${cx - h.half} ${h.top + 8} Q ${cx - h.half} ${h.top} ${cx - h.half + 8} ${h.top} H ${cx + h.half - 8} ` +
      `Q ${cx + h.half} ${h.top} ${cx + h.half} ${h.top + 8} V ${h.bottom - 46} ` +
      `C ${cx + h.half} ${h.bottom - 20} ${cx + h.bottomHalf} ${h.bottom - 14} ${cx + h.bottomHalf} ${h.bottom} ` +
      `H ${cx - h.bottomHalf} C ${cx - h.bottomHalf} ${h.bottom - 14} ${cx - h.half} ${h.bottom - 20} ${cx - h.half} ${h.bottom - 46} Z`
    )
  })

  // The finger rest: a hook out of the handle's back, curling down at its end.
  const hook = $derived.by(() => {
    const { top, bottom, out } = at.hook
    const x = cx + at.handle.half - 2
    return (
      `M ${x} ${top} C ${x + 14} ${top - 4} ${out - 8} ${top - 4} ${out} ${top + 12} ` +
      `C ${out + 2} ${top + 24} ${out} ${bottom - 12} ${out - 3} ${bottom - 2} ` +
      `C ${out - 5} ${bottom + 3} ${out - 12} ${bottom + 2} ${out - 11} ${bottom - 4} ` +
      `C ${out - 10} ${bottom - 14} ${out - 10} ${top + 24} ${out - 16} ${top + 22} ` +
      `C ${out - 22} ${top + 21} ${x + 6} ${top + 24} ${x} ${top + 26} Z`
    )
  })

  const shaft = $derived.by(() => {
    const s = at.shaft
    const t = s.halfAt(s.top)
    const b = s.halfAt(s.bottom)
    return `M ${cx - t} ${s.top} H ${cx + t} L ${cx + b} ${s.bottom - 3} Q ${cx + b} ${s.bottom} ${cx + b - 3} ${s.bottom} H ${cx - b + 3} Q ${cx - b} ${s.bottom} ${cx - b} ${s.bottom - 3} Z`
  })

  // The tip ejector: an arm down the shaft's left side, bending in to a collar around it.
  const ejector = $derived.by(() => {
    const e = at.ejector
    const top = e.sleeve.top
    const bend = top - 14
    const half = at.shaft.halfAt(top) + 6
    return {
      arm: `M ${e.armLeft} ${at.nut.bottom - 2} H ${e.armRight} V ${bend} L ${cx - half + 6} ${top + 2} H ${cx - half} L ${e.armLeft} ${bend + 4} Z`,
      sleeve: `M ${cx - half} ${top} H ${cx + half} L ${cx + e.sleeveHalf} ${e.sleeve.bottom - 3} Q ${cx + e.sleeveHalf} ${e.sleeve.bottom} ${cx + e.sleeveHalf - 3} ${e.sleeve.bottom} H ${cx - e.sleeveHalf + 3} Q ${cx - e.sleeveHalf} ${e.sleeve.bottom} ${cx - e.sleeveHalf} ${e.sleeve.bottom - 3} Z`,
    }
  })

  const tip = $derived.by(() => {
    const t = at.tip
    const rim = 7
    return {
      rim: { x: cx - t.topHalf - 1.5, y: t.top, width: 2 * t.topHalf + 3, height: rim },
      cone: `M ${cx - t.topHalf} ${t.top + rim} H ${cx + t.topHalf} L ${cx + t.bottomHalf} ${t.bottom} H ${cx - t.bottomHalf} Z`,
    }
  })

  /** The knurled wheel's grooves, evenly across its face. */
  const grooves = $derived(Array.from({ length: 7 }, (_, i) => cx - at.wheel.half + ((i + 1) * 2 * at.wheel.half) / 8))
</script>

<g stroke-linejoin="round" stroke-linecap="round">
  <!-- the tip ejector button, on its stem into the handle -->
  <rect x={at.ejectorStem.left} y={at.ejectorButton.bottom - 2} width={at.ejectorStem.right - at.ejectorStem.left} height={at.handle.top - at.ejectorButton.bottom + 4} fill={body} stroke={INK} stroke-width={1.6 * k} />
  <rect x={at.ejectorButton.left} y={at.ejectorButton.top} width={at.ejectorButton.right - at.ejectorButton.left} height={at.ejectorButton.bottom - at.ejectorButton.top} rx={3} fill={body} stroke={INK} stroke-width={2 * k} />

  <!-- the plunger: its button on a rod -->
  <rect x={cx - at.rod.half} y={at.rod.top - 2} width={2 * at.rod.half} height={at.rod.bottom - at.rod.top + 4} fill={body} stroke={INK} stroke-width={1.6 * k} />
  <path
    d="M {cx - at.button.half} {at.button.bottom} V {at.button.top + 7} Q {cx - at.button.half} {at.button.top} {cx - at.button.half + 7} {at.button.top} H {cx + at.button.half - 7} Q {cx + at.button.half} {at.button.top} {cx + at.button.half} {at.button.top + 7} V {at.button.bottom} Z"
    fill={accent}
    stroke={INK}
    stroke-width={2 * k}
  />

  <!-- the wheel for setting the volume -->
  <rect x={cx - at.wheel.half} y={at.wheel.top} width={2 * at.wheel.half} height={at.wheel.bottom - at.wheel.top + 2} rx={3} fill={body} stroke={INK} stroke-width={2 * k} />
  {#each grooves as x (x)}
    <line x1={x} x2={x} y1={at.wheel.top + 3} y2={at.wheel.bottom - 2} stroke={INK} stroke-opacity="0.45" stroke-width={k} />
  {/each}

  <!-- the finger rest, then the handle over its root -->
  <path d={hook} fill={body} stroke={INK} stroke-width={2 * k} />
  <path d={handle} fill={body} stroke={INK} stroke-width={2 * k} />

  <!-- the shaft, with the tip ejector around it and the nut joining it to the handle -->
  <path d={shaft} fill={body} stroke={INK} stroke-width={2 * k} />
  <path d={ejector.arm} fill={body} stroke={INK} stroke-width={1.6 * k} />
  <path d={ejector.sleeve} fill={body} stroke={INK} stroke-width={2 * k} />
  <rect x={cx - at.nut.half} y={at.nut.top - 2} width={2 * at.nut.half} height={at.nut.bottom - at.nut.top + 2} rx={3} fill={body} stroke={INK} stroke-width={2 * k} />

  {#if at.withTip}
    <path d={tip.cone} fill={TIPS[p.tip]} fill-opacity={color ? 0.75 : 0} stroke={INK} stroke-width={1.6 * k} />
    <rect {...tip.rim} rx={1.5} fill={TIPS[p.tip]} fill-opacity={color ? 0.9 : 0} stroke={INK} stroke-width={1.6 * k} />
  {/if}

  <!-- the model, printed above the window -->
  {#if showModel}
    <text x={cx} y={at.modelY} dy="0.35em" text-anchor="middle" font-size="12" font-weight="700" fill={INK}>{p.model}</text>
  {/if}

  <!-- the window and its three digit wheels, read top to bottom -->
  <rect x={at.window.left} y={at.window.top} width={at.window.right - at.window.left} height={at.window.bottom - at.window.top} rx={5} fill="#fff" stroke={INK} stroke-width={2.2 * k} />
  {#each digits as d, i (i)}
    {@const top = at.wheels.top + i * WHEEL_H}
    {#if i > 0}
      <line x1={at.wheels.left} x2={at.wheels.right} y1={top} y2={top} stroke={INK} stroke-opacity="0.35" stroke-width={0.8 * k} />
    {/if}
    <text x={cx} y={at.wheelY(i)} dy="0.36em" text-anchor="middle" font-size={DIGIT_SIZE} font-weight="700" fill={color && p.red[i] ? RED : INK}>{d}</text>
  {/each}
  {#if line !== null}
    {@const y = at.wheels.top + line * WHEEL_H}
    <line x1={at.window.left} x2={at.window.right} y1={y} y2={y} stroke={INK} stroke-width={2.4 * k} stroke-linecap="butt" />
  {/if}
</g>
