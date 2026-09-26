<script lang="ts">
  // The button before an equation, drawn the way that equation is graphed (its
  // color, line style and arrows, or dots or crosses for points), so each row reads as
  // its own line on the grid. It opens a small popup to change those. Fixed-position like
  // CapPicker's menu, so the scrolling settings column can't clip it.
  import { tick } from 'svelte'
  import { ARROWS, COLORS, LINE_STYLES, POINT_STYLES, type Arrows, type Color, type LineStyle, type PointStyle, type Row } from './equations.js'

  // row: { color, line, arrows, point }, edited in place. isPoints: only color and point apply.
  let { row, label, id, isPoints = false }: { row: Row; label: string; id: string; isPoints?: boolean } = $props()

  let open = $state(false)
  let root = $state<HTMLElement>()
  let trigger = $state<HTMLButtonElement>()
  let panel = $state<HTMLElement>()
  let pos = $state({ left: 0, top: 0 })

  const GAP = 6
  const EDGE = 8

  async function show() {
    open = true
    await tick()
    const r = trigger!.getBoundingClientRect()
    const h = panel!.offsetHeight
    const w = panel!.offsetWidth
    const below = r.bottom + GAP + h <= window.innerHeight - EDGE
    pos = {
      top: Math.max(EDGE, below ? r.bottom + GAP : r.top - GAP - h),
      left: Math.max(EDGE, Math.min(r.left, window.innerWidth - EDGE - w)),
    }
    panel!.querySelector<HTMLElement>('[aria-checked=true]')?.focus()
  }
  function hide(refocus = true) {
    open = false
    if (refocus) trigger?.focus()
  }
  function onpointerdown(event: PointerEvent) {
    if (open && !root!.contains(event.target as Node)) hide(false)
  }
  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      hide()
    }
  }
</script>

<svelte:window {onpointerdown} onresize={() => open && hide(false)} onscrollcapture={(e) => open && !panel?.contains(e.target as Node) && hide(false)} />

<!-- How this row looks on the grid, in miniature. -->
{#snippet preview()}
  {@const ink = COLORS[row.color]}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    {#if isPoints}
      {#each [[7, 16], [17, 8]] as [x, y]}
        {#if row.point === 'cross'}
          <path d="M{x - 3.2},{y - 3.2} L{x + 3.2},{y + 3.2} M{x - 3.2},{y + 3.2} L{x + 3.2},{y - 3.2}" stroke={ink} stroke-width="2" stroke-linecap="round" />
        {:else}
          <circle cx={x} cy={y} r="3" fill={ink} />
        {/if}
      {/each}
    {:else}
      {@const left = row.arrows === 'both' || row.arrows === 'left'}
      {@const right = row.arrows === 'both' || row.arrows === 'right'}
      <line
        x1={left ? 7.5 : 4} y1={left ? 16.5 : 20} x2={right ? 16.5 : 20} y2={right ? 7.5 : 4}
        stroke={ink} stroke-width={row.line === 'dotted' ? 2.6 : 2.2}
        stroke-dasharray={row.line === 'dashed' ? '4 2.6' : row.line === 'dotted' ? '0.01 3.6' : undefined}
        stroke-linecap={row.line === 'dotted' ? 'round' : 'butt'}
      />
      {#if left}<path d="M3,21 L5.1,13.9 L10.1,18.9 z" fill={ink} />{/if}
      {#if right}<path d="M21,3 L18.9,10.1 L13.9,5.1 z" fill={ink} />{/if}
    {/if}
  </svg>
{/snippet}

{#snippet lineIcon(style: LineStyle)}
  <svg viewBox="0 0 28 12" width="28" height="12" aria-hidden="true">
    <line
      x1="3" y1="6" x2="25" y2="6" stroke="currentColor" stroke-width="2.5"
      stroke-dasharray={style === 'dashed' ? '6 4' : style === 'dotted' ? '0.01 4.5' : undefined}
      stroke-linecap={style === 'dotted' ? 'round' : 'butt'}
    />
  </svg>
{/snippet}

{#snippet pointIcon(style: PointStyle)}
  <svg viewBox="0 0 28 12" width="28" height="12" aria-hidden="true">
    {#if style === 'cross'}
      <path d="M10,2 L18,10 M10,10 L18,2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
    {:else}
      <circle cx="14" cy="6" r="4" fill="currentColor" />
    {/if}
  </svg>
{/snippet}

{#snippet arrowIcon(ends: Arrows)}
  <svg viewBox="0 0 28 12" width="28" height="12" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="2">
    <line x1={ends === 'both' || ends === 'left' ? 8 : 3} y1="6" x2={ends === 'both' || ends === 'right' ? 20 : 25} y2="6" />
    {#if ends === 'both' || ends === 'left'}<path d="M2,6 L9,2 L9,10 z" stroke="none" />{/if}
    {#if ends === 'both' || ends === 'right'}<path d="M26,6 L19,2 L19,10 z" stroke="none" />{/if}
  </svg>
{/snippet}

<div class="row-style" bind:this={root}>
  <button
    bind:this={trigger}
    type="button"
    class="icon-btn outline"
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-label="Customize {label}"
    data-tip={open ? undefined : 'Customize'}
    onclick={() => (open ? hide() : show())}
  >
    {@render preview()}
  </button>

  {#if open}
    <div
      bind:this={panel}
      class="panel"
      role="dialog"
      tabindex="-1"
      aria-label="Customize {label}"
      style="left: {pos.left}px; top: {pos.top}px"
      {onkeydown}
    >
      <div class="group">
        <span class="name" id="{id}-color">Color</span>
        <div class="swatches" role="radiogroup" aria-labelledby="{id}-color">
          {#each (Object.entries(COLORS) as [Color, string][]) as [name, hex]}
            <button
              type="button"
              class="swatch"
              role="radio"
              aria-checked={row.color === name}
              aria-label={name}
              title={name[0].toUpperCase() + name.slice(1)}
              style="--swatch: {hex}"
              onclick={() => (row.color = name)}
            ></button>
          {/each}
        </div>
      </div>

      {#if isPoints}
        <div class="group">
          <span class="name" id="{id}-point">Point</span>
          <div class="segmented" role="radiogroup" aria-labelledby="{id}-point">
            {#each (Object.entries(POINT_STYLES) as [PointStyle, string][]) as [v, name]}
              <button type="button" role="radio" aria-checked={row.point === v} aria-label={name} title={name} class:on={row.point === v} onclick={() => (row.point = v)}>
                {@render pointIcon(v)}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="group">
          <span class="name" id="{id}-line">Line</span>
          <div class="segmented" role="radiogroup" aria-labelledby="{id}-line">
            {#each (Object.entries(LINE_STYLES) as [LineStyle, string][]) as [v, name]}
              <button type="button" role="radio" aria-checked={row.line === v} aria-label={name} title={name} class:on={row.line === v} onclick={() => (row.line = v)}>
                {@render lineIcon(v)}
              </button>
            {/each}
          </div>
        </div>

        <div class="group">
          <span class="name" id="{id}-arrows">Arrows</span>
          <div class="segmented" role="radiogroup" aria-labelledby="{id}-arrows">
            {#each (Object.entries(ARROWS) as [Arrows, string][]) as [v, name]}
              <button type="button" role="radio" aria-checked={row.arrows === v} aria-label={name} title={name} class:on={row.arrows === v} onclick={() => (row.arrows = v)}>
                {@render arrowIcon(v)}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Outlined, so it reads as its own control, apart from the plain × at the row's end. */
  /* As tall as the math field beside it (square on one line), always as wide, so
     the fields line up down the list even when one holds a stacked fraction. */
  .row-style { display: flex; align-self: stretch; }
  .outline { width: 2.86rem; height: auto; border: 1.5px solid var(--border); border-radius: 10px; background: #fff; }
  .outline:hover:not(:disabled), .outline[aria-expanded='true'] { border-color: var(--blue-border); background: var(--blue-soft); }
  .panel {
    position: fixed;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 12px 32px -8px rgb(17 24 39 / 25%);
  }
  .group { display: flex; flex-direction: column; gap: 0.35rem; }
  .name { font-size: 0.75rem; font-weight: 700; color: var(--muted); }
  .swatches { display: flex; gap: 0.4rem; }
  .swatch {
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border: 2px solid #fff;
    border-radius: 6px;
    background: var(--swatch);
    box-shadow: 0 0 0 1px var(--border);
    cursor: pointer;
  }
  .swatch[aria-checked='true'] { box-shadow: 0 0 0 2px var(--blue); }
  .swatch:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--blue), 0 0 0 4px var(--blue-border); }
  .segmented button { display: inline-grid; place-items: center; padding: 0.3rem 0.45rem; }
</style>
