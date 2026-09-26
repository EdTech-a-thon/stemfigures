<script lang="ts">
  // The coordinate grid itself, as a self-contained SVG that prints crisply and
  // exports cleanly to PNG/SVG (fonts and colors are inline, no page CSS).
  import type { Cap } from '$lib/shared/caps.js'
  import { buildGraph } from './graph.js'
  import type { Settings } from './settings.js'

  // id: prefixes the arrowheads' ids, which have to be unique on the page.
  let { settings, svg = $bindable(), id = 'g' }: { settings: Settings; svg?: SVGSVGElement; id?: string } = $props()

  const g = $derived(buildGraph(settings))
  const INK = '#111827'
  const cap = (c: Cap) => (c === 'none' ? undefined : `url(#${id}-${c})`)
  const SANS = 'Arial, Helvetica, sans-serif'
  const SERIF = "'Times New Roman', Times, serif"
</script>

<svg
  bind:this={svg}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {g.width} {g.height}"
  width={g.width}
  height={g.height}
  role="img"
  aria-label={settings.title || 'Coordinate grid'}
>
  <defs>
    <!-- Axis end caps; each axis runs from its start (left/bottom) to its end (right/top). -->
    <marker id="{id}-triangle" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={INK} />
    </marker>
    <marker id="{id}-line" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path d="M1.5,1 L8.6,5 L1.5,9" fill="none" stroke={INK} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
    <marker id="{id}-circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="5" fill={INK} />
    </marker>
  </defs>

  <rect width={g.width} height={g.height} fill="#fff" />

  <g stroke={INK} stroke-width="1" shape-rendering="crispEdges">
    {#each g.vLines as x}<line x1={x} y1={g.grid.y} x2={x} y2={g.grid.y + g.grid.h} />{/each}
    {#each g.hLines as y}<line x1={g.grid.x} y1={y} x2={g.grid.x + g.grid.w} y2={y} />{/each}
  </g>

  <g stroke={INK} stroke-width="2.4">
    <line
      x1={g.xAxis.x1} y1={g.xAxis.y} x2={g.xAxis.x2} y2={g.xAxis.y}
      marker-start={cap(settings.xStartCap)} marker-end={cap(settings.xEndCap)}
    />
    <line
      x1={g.yAxis.x} y1={g.yAxis.y1} x2={g.yAxis.x} y2={g.yAxis.y2}
      marker-start={cap(settings.yStartCap)} marker-end={cap(settings.yEndCap)}
    />
  </g>

  {#each g.lines as l}
    <path d={l.d} fill="none" stroke={l.color} stroke-width={l.width} stroke-dasharray={l.dash} stroke-linecap={l.cap} stroke-linejoin="round" />
    {#each l.heads as d}<path {d} fill={l.color} />{/each}
  {/each}
  {#each g.dots as d}
    {#if d.cross}
      <path d="M{d.x - 5.5},{d.y - 5.5} L{d.x + 5.5},{d.y + 5.5} M{d.x - 5.5},{d.y + 5.5} L{d.x + 5.5},{d.y - 5.5}" stroke={d.color} stroke-width="2.4" stroke-linecap="round" />
    {:else}
      <circle cx={d.x} cy={d.y} r="4.5" fill={d.color} />
    {/if}
  {/each}

  <g font-family={SANS} font-size={g.fs} font-weight="bold" fill={INK} stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">
    {#each g.numbers as n}<text x={n.x} y={n.y} text-anchor={n.anchor}>{n.text}</text>{/each}
  </g>

  {#each g.labels as l}
    {#if l.kind === 'title'}
      <text x={l.x} y={l.y} text-anchor="middle" font-family={SANS} font-size={g.fs * 1.6} font-weight="bold" fill={INK}>{l.text}</text>
    {:else if l.kind === 'tip'}
      <text x={l.x} y={l.y} text-anchor={l.anchor} font-family={SERIF} font-style="italic" font-weight="bold" font-size={g.fs * 1.4} fill={INK}>{l.text}</text>
    {:else}
      <text
        x={l.x} y={l.y} text-anchor="middle" dominant-baseline={l.rotate ? 'central' : undefined}
        transform={l.rotate ? `rotate(-90 ${l.x} ${l.y})` : undefined}
        font-family={SANS} font-size={g.fs * 1.2} font-weight="bold" fill={INK}
      >{l.text}</text>
    {/if}
  {/each}

  <g stroke={INK} stroke-width="1.5">
    {#each g.blanks as b}<line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} />{/each}
  </g>
</svg>

<style>
  svg { display: block; width: 100%; height: auto; }
</style>
