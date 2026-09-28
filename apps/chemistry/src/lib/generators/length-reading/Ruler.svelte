<script lang="ts">
  // A ruler drawn at `zoom` (1 for the whole ruler; more inside a
  // magnifier, where lines and numbers stay a comfortable size), in the
  // units of rulerGeometry: marked down from its top edge, numbered under
  // each centimeter or inch, with its unit in the corner.
  import { sizeAt } from '$lib/shared/magnify'
  import { UNITS, rulerTicks, type RulerGeometry, type RulerScale } from './ruler'

  let { g, scale, zoom = 1 }: { g: RulerGeometry; scale: RulerScale; zoom?: number } = $props()

  const k = $derived(sizeAt(zoom))
  const font = $derived(15 * k)
  const ticks = $derived(rulerTicks(scale))
  const labelY = $derived(g.tickHeight(0) + 3 * k + font * 0.85)
</script>

<g stroke-linecap="butt">
  <rect x="0" y="0" width={g.width} height={g.height} rx="4" fill="#f4f4f4" stroke="#111" stroke-width={2 * k} />
  {#each ticks as t (t.value)}
    {@const x = g.xOf(t.value)}
    <line x1={x} x2={x} y1="0" y2={g.tickHeight(t.level)} stroke="#111" stroke-width={(t.level === 0 ? 1.5 : 1) * k} />
    {#if t.label}
      <text {x} y={labelY} text-anchor="middle" font-size={font} fill="#111">{t.label}</text>
    {/if}
  {/each}
  <text x={g.xOf(0)} y={g.height - 10} text-anchor="middle" font-size={font * 0.85} font-weight="700" fill="#111">{UNITS[scale.system]}</text>
</g>
