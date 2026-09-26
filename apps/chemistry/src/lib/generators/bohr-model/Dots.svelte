<script lang="ts">
  // Protons, neutrons and electrons as drawn: a disc in the component's
  // color with a dark outline, and its symbol, if it has one, in the middle.
  import { COLOR_FILL, symbolFill, symbolText, type Component, type ComponentLook, type Dot } from './model'

  let { dots, looks }: { dots: Dot[]; looks: Record<Component, ComponentLook> } = $props()

  /** Two-character symbols ("p⁺", "e⁻") are set smaller so they fit. */
  const fontSize = (d: Dot, text: string) => d.r * ([...text].length > 1 ? 1.15 : 1.5)
</script>

{#each dots as d, i (i)}
  {@const look = looks[d.component]}
  {@const text = symbolText(look.symbol)}
  <circle cx={d.x} cy={d.y} r={d.r} fill={COLOR_FILL[look.color]} stroke="#222" stroke-width={d.component === 'electron' && !text ? 1 : 1.2} />
  {#if text}
    <text
      x={d.x}
      y={d.y}
      text-anchor="middle"
      dominant-baseline="central"
      font-size={fontSize(d, text)}
      font-weight="700"
      fill={symbolFill(look.color)}>{text}</text
    >
  {/if}
{/each}
