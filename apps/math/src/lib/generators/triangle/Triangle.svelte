<script lang="ts">
  // The triangle itself, as a self-contained SVG that prints crisply and
  // exports cleanly to PNG/SVG (fonts and colors are inline, no page CSS).
  // With `onmove`, its labels can be dragged: onmove(part, [along, across])
  // gets the label's new offset from its usual spot. The frame holds still
  // while a label is dragged, so the figure doesn't rescale under the pointer.
  import FigureLabels from '$lib/shared/FigureLabels.svelte'
  import type { TriangleLayout, Vec } from './layout.js'
  import { INK, type LineStyle, type Offset } from './settings.js'

  let {
    figure, svg = $bindable(), label = 'Triangle', onmove = null,
  }: { figure: TriangleLayout; svg?: SVGSVGElement; label?: string; onmove?: ((part: string, offset: Offset) => void) | null } = $props()

  let frozen = $state<TriangleLayout['frame'] | null>(null)
  const f = $derived(frozen ?? figure.frame)

  const DASH: Record<LineStyle, string | undefined> = { solid: undefined, dashed: '7 5', dotted: '0.01 5' }
  const pts = (list: Vec[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
</script>

<svg
  bind:this={svg}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="{f.x} {f.y} {f.w} {f.h}"
  width={f.w}
  height={f.h}
  role="img"
  aria-label={label}
>
  <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="#fff" />

  {#each figure.extensions as [p, q]}
    <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={INK} stroke-width="1.6" stroke-dasharray="6 5" />
  {/each}
  {#each figure.heights as h}
    <line
      x1={h.from[0]} y1={h.from[1]} x2={h.to[0]} y2={h.to[1]} stroke={INK} stroke-width={h.style === 'dotted' ? 2.4 : 1.8}
      stroke-dasharray={DASH[h.style]} stroke-linecap={h.style === 'dotted' ? 'round' : 'butt'}
    />
  {/each}

  <g fill="none" stroke={INK} stroke-width="1.6">
    {#each figure.squares as sq}<polyline points={pts(sq)} />{/each}
    {#each figure.arcs as d}<path {d} />{/each}
    {#each figure.ticks as [p, q]}<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke-width="1.8" />{/each}
  </g>

  <polygon points={pts(figure.corners)} fill="none" stroke={INK} stroke-width="2.4" stroke-linejoin="round" />

  <FigureLabels labels={figure.labels} ink={INK} {onmove} ondrag={(on) => (frozen = on ? figure.frame : null)} />
</svg>

<style>
  svg { display: block; width: 100%; height: auto; user-select: none; -webkit-user-select: none; }
</style>
