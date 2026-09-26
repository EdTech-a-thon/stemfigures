<script lang="ts">
  // The Coordinate Grid Generator: presets, what's graphed and collapsed settings on the left,
  // the figure card on the right. On a wide screen the page itself never
  // scrolls; only the settings column does. Settings are mirrored into the
  // page address so a bookmark or shared link brings back exactly this grid,
  // and the server renders that same grid on first load.
  import { Heading, MoveRight, MoveUp, Plus, X } from '@lucide/svelte'
  import { afterNavigate, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import CapPicker from '$lib/shared/CapPicker.svelte'
  import type { Cap } from '$lib/shared/caps.js'
  import FigureCanvas from '$lib/shared/FigureCanvas.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import { niceText } from '$lib/shared/numbering.js'
  import Presets from '$lib/shared/Presets.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { createHistory } from '$lib/shared/history.svelte.js'
  import { ROW_DEFAULTS, readEquations, type Row } from './equations.js'
  import RowStyle from './RowStyle.svelte'
  import Graph from './Graph.svelte'
  import { presetStore } from './presets.js'
  import {
    CAPS, cleanSettings, readAxes, sameGraph, settingsFromParams, settingsToQuery, type AxisName, type Settings,
  } from './settings.js'

  // There's always a row to type the next equation in.
  const blankRow = (): Row => ({ ...ROW_DEFAULTS })
  const withRow = (s: Settings): Settings => (s.equations.length ? s : { ...s, equations: [blankRow()] })

  let settings = $state(withRow(settingsFromParams(page.url.searchParams)))
  const clean = $derived(cleanSettings(settings))
  const query = $derived(settingsToQuery(clean))
  const axes = $derived(readAxes(clean))
  const rows = $derived(
    readEquations(clean.equations.map((r) => r.text), {
      x0: axes.x.start, x1: axes.x.start + axes.x.blocks * axes.x.step,
      y0: axes.y.start, y1: axes.y.start + axes.y.blocks * axes.y.step,
    }),
  )

  // A new row, unless the last one is still empty, which gets the focus instead.
  function addRow() {
    if (settings.equations.at(-1)?.text.trim() !== '') settings.equations.push(blankRow())
    const i = settings.equations.length - 1
    requestAnimationFrame(() => document.getElementById(`eq-${i}`)?.focus())
  }
  function removeRow(i: number) {
    settings.equations.splice(i, 1)
    if (!settings.equations.length) settings.equations.push(blankRow())
  }

  // The router can't replace the address until the page has hydrated, which
  // matters when a link arrives written differently from how we'd write it.
  let routerReady = $state(false)
  afterNavigate(() => (routerReady = true))
  $effect(() => {
    const url = query ? `${page.url.pathname}?${query}` : page.url.pathname
    if (routerReady && url !== `${location.pathname}${location.search}`) replaceState(url, page.state)
  })

  const history = createHistory({
    read: () => $state.snapshot(clean),
    write: (snap) => (settings = withRow(snap)),
    keyOf: settingsToQuery,
    tidy: cleanSettings,
    storageKey: 'mathfigures.coordinate-grid.history',
  })

  const EVERY_OPTIONS: [number, string][] = [
    [1, 'Every line'],
    [2, 'Every 2nd line'],
    [5, 'Every 5th line'],
    [10, 'Every 10th line'],
    [0, 'No numbers'],
  ]
  // Each axis runs from its start end (left/bottom) to its end end (right/top).
  const AXES = [
    { axis: 'x', heading: 'x-axis', icon: MoveRight, ends: [['Start', 'Left end', 'left'], ['End', 'Right end', 'right']] },
    { axis: 'y', heading: 'y-axis', icon: MoveUp, ends: [['Start', 'Bottom end', 'down'], ['End', 'Top end', 'up']] },
  ] as const

  // Named the way Excel and Sheets name them: a chart title and axis titles.
  const TITLES = [
    { key: 'title', name: 'Chart title', placeholder: 'Distance over time' },
    { key: 'xTitle', name: 'x-axis title', placeholder: 'Time (hours)' },
    { key: 'yTitle', name: 'y-axis title', placeholder: 'Distance (km)' },
  ] as const
  const RANGE_FIELDS = [
    ['From', 'From'],
    ['To', 'To'],
    ['Step', 'Count by'],
  ] as const
  function axisSummary(axis: AxisName) {
    const { start, step, blocks, numbering } = axes[axis]
    const every = clean[`${axis}Every` as const]
    const n = (v: number) => niceText(v, numbering)
    return [
      `${n(start)} to ${n(start + blocks * step)}`,
      `by ${n(step)}`,
      every ? (every === 1 ? 'numbered' : `numbered every ${every}`) : 'unnumbered',
      clean[`${axis}LabelMode` as const] === 'text' && clean[`${axis}Label` as const].trim() ? `“${clean[`${axis}Label` as const].trim()}”` : 'no label',
      endsSummary(clean[`${axis}StartCap` as const], clean[`${axis}EndCap` as const]),
    ].join(' · ')
  }
  function endsSummary(start: Cap, end: Cap) {
    if (start === end) return start === 'none' ? 'plain ends' : `${CAPS[start].toLowerCase()}s`
    return `${CAPS[start].toLowerCase()} / ${CAPS[end].toLowerCase()}`
  }
  const titlesSummary = $derived.by(() => {
    const shown = (key: (typeof TITLES)[number]['key']) => (clean[`${key}Mode` as const] === 'text' ? clean[key].trim() : '')
    const parts = TITLES.map(({ key, name }) =>
      clean[`${key}Mode` as const] === 'blank' ? `${name}: blank line` : shown(key) ? `“${shown(key)}”` : '',
    )
    return parts.filter(Boolean).join(' · ') || 'None'
  })

  function applyPreset(preset: Settings) {
    settings = withRow(cleanSettings($state.snapshot(preset)))
  }

  let svg = $state<SVGSVGElement>()
  const filename = $derived(
    (clean.titleMode === 'text' && clean.title.trim() ? clean.title.trim() : 'coordinate-grid')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'coordinate-grid',
  )

</script>

<div class="page no-print">
  <h1 class="visually-hidden">Coordinate Grid Generator</h1>
  <div class="layout">
    <div class="controls">
      <section class="card">
        <h2 class="card-head">Presets</h2>
        <Presets store={presetStore} same={sameGraph} settings={clean} onapply={applyPreset} />
      </section>

      <section class="card equations">
        <div class="head-row">
          <h2 class="card-head flush">Equations</h2>
          <HelpTip id="equation-tip" label="How to type an equation">
            Type a line like y = 2x + 1, 2x + 3y = 6 or x = 4, a curve like y = x^2 − 4 or y = −(x − 2)^2 + 3, or points like
            (2, 3) or (1, 2), (3, 4). Type ^ for an exponent, / for a fraction and pi for π.
          </HelpTip>
        </div>
        {#each settings.equations as row, i}
          <div class="row">
            <RowStyle {row} id="eq-{i}-style" label="equation {i + 1}" isPoints={!!rows[i]?.points} />
            <MathInput
              kind="equation"
              id="eq-{i}"
              aria-label="Equation {i + 1}"
              placeholder={i === 0 ? 'y = 2x + 1' : ''}
              aria-invalid={!!rows[i]?.problem}
              bind:value={row.text}
            />
            <button class="icon-btn" aria-label="Remove equation {i + 1}" data-tip="Remove" onclick={() => removeRow(i)}><X size={17} /></button>
          </div>
          {#if rows[i]?.problem}<p class="help problem">{rows[i].problem}</p>{/if}
        {/each}
        <button class="add" onclick={addRow}><Plus size={16} aria-hidden="true" /> Add equation</button>
      </section>

      <section class="card sections">
        <Section title="Titles" icon={Heading} summary={titlesSummary}>
          {#each TITLES as { key, name, placeholder }}
            <div class="field">
              <span>{name}</span>
              <LabelField {name} {placeholder} bind:mode={settings[`${key}Mode` as const]} bind:text={settings[key]} />
            </div>
          {/each}
        </Section>

        {#each AXES as { axis, heading, icon, ends }}
          <Section title={heading} {icon} summary={axisSummary(axis)}>
            <div class="grid-fields">
              {#each RANGE_FIELDS as [key, name]}
                <div class="range-field">
                  <label for="{axis}-{key}">{name}</label>
                  <MathInput id="{axis}-{key}" aria-invalid={!!axes.problems[`${axis}${key}`]} bind:value={settings[`${axis}${key}` as const]} />
                </div>
              {/each}
            </div>
            {#each RANGE_FIELDS as [key]}
              {#if axes.problems[`${axis}${key}`]}<p class="help problem">{axes.problems[`${axis}${key}`]}</p>{/if}
            {/each}
            <label class="field">
              Numbers
              <select bind:value={settings[`${axis}Every` as const]}>
                {#each EVERY_OPTIONS as [v, label]}<option value={v}>{label}</option>{/each}
              </select>
            </label>
            <div class="field">
              <span>Label <span class="hint">at the {axis === 'x' ? 'right' : 'top'} end</span></span>
              <LabelField
                name="{heading} label"
                placeholder={axis}
                blank={false}
                bind:mode={settings[`${axis}LabelMode` as const]}
                bind:text={settings[`${axis}Label` as const]}
              />
            </div>
            <div class="ends">
              {#each ends as [key, name, direction]}
                <div class="field">
                  <span>{name}</span>
                  <CapPicker options={CAPS} label="{heading} {name.toLowerCase()}" {direction} bind:value={settings[`${axis}${key}Cap` as const]} />
                </div>
              {/each}
            </div>
          </Section>
        {/each}
      </section>
    </div>

    <div class="preview">
      <FigureCanvas {svg} {filename} {history}>
        <Graph settings={clean} bind:svg />
      </FigureCanvas>
    </div>
  </div>
</div>

<!-- What actually prints: just the graph, sized to the page. -->
<div class="print-sheet">
  <Graph settings={clean} id="p" />
</div>

<style>
  .page { padding: 1.25rem 1.25rem 1rem; }

  .layout { display: grid; grid-template-columns: minmax(0, 24rem) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: minmax(0, 1fr); } }

  .controls { display: flex; flex-direction: column; gap: 1rem; }
  /* Cards keep their full height so the column scrolls instead of squashing
     them (the settings card clips its corners, which would let it shrink). */
  .controls > :global(*) { flex-shrink: 0; }

  /* Wide screens: the page fills the window exactly. The settings column
     scrolls on its own; the graph shrinks to fit beside it. */
  @media (min-width: 861px) and (min-height: 560px) {
    .page { height: calc(100dvh - var(--topbar-h)); display: flex; flex-direction: column; }
    .layout { flex: 1; min-height: 0; grid-template-rows: minmax(0, 1fr); align-items: stretch; }
    .controls {
      min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
      margin: 0 -0.75rem -1rem; padding: 0 0.75rem 1.25rem;
    }
    .preview { display: flex; flex-direction: column; min-height: 0; }
  }
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); padding: 1rem 1.1rem 0; }
  .card-head + :global(.presets) { padding-top: 0.6rem; }
  .sections { overflow: hidden; }
  .card-head.flush { padding: 0; }

  .equations { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; }
  .row { display: flex; align-items: center; gap: 0.25rem; }
  .row > :global(.caret-field) { flex: 1; min-width: 0; margin: 0 0.2rem 0 0.15rem; }
  .equations .help { margin: -0.2rem 0 0; font-size: 0.84rem; }
  .add {
    align-self: flex-start; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.6rem;
    border: 1.5px dashed var(--border); border-radius: 999px; background: none; color: var(--blue-dark); font-weight: 700; font-size: 0.85rem;
  }
  .add:hover { background: var(--blue-soft); }

  .grid-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.6rem; margin-bottom: 0.75rem; }
  .range-field { display: flex; flex-direction: column; gap: 0.3rem; font-weight: 600; font-size: 0.88rem; min-width: 0; }
  .grid-fields ~ .help { margin: -0.3rem 0 0.75rem; font-size: 0.84rem; }
  .help.problem { color: var(--red); font-weight: 600; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; }
  .field:last-child { margin-bottom: 0; }
  .field .hint { font-weight: 400; color: var(--muted); }
  .ends { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  .ends .field { margin-bottom: 0; }


  .print-sheet { display: none; }
  @media print {
    @page { size: letter portrait; margin: 0.5in; }
    .print-sheet { display: block; width: 7.5in; height: 9.8in; break-inside: avoid; }
    .print-sheet :global(svg) { width: 100%; height: 100%; }
  }
</style>
