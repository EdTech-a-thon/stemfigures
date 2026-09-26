<script lang="ts">
  // The Number Line Generator: presets, the equations and the line's settings
  // on the left, the figure card on the right. Settings are mirrored into the page
  // address so a bookmark or shared link brings back exactly this number line,
  // and the server renders that same line on first load.
  import { Plus, Ruler, X } from '@lucide/svelte'
  import { afterNavigate, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import FigureCanvas from '$lib/shared/FigureCanvas.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import Presets from '$lib/shared/Presets.svelte'
  import RowStyle from '$lib/shared/RowStyle.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { createHistory } from '$lib/shared/history.svelte.js'
  import { niceText } from '$lib/shared/numbering.js'
  import NumberLine from './NumberLine.svelte'
  import { presetStore } from './presets.js'
  import { ROW_DEFAULTS, cleanSettings, readLine, sameFigure, settingsFromParams, settingsToQuery, type Row, type Settings } from './settings.js'

  // There's always a row to type the next equation in.
  const blankRow = (): Row => ({ ...ROW_DEFAULTS })
  const withRow = (s: Settings): Settings => (s.equations.length ? s : { ...s, equations: [blankRow()] })

  let settings = $state(withRow(settingsFromParams(page.url.searchParams)))
  const clean = $derived(cleanSettings(settings))
  const query = $derived(settingsToQuery(clean))
  const line = $derived(readLine(clean))

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
    storageKey: 'mathfigures.number-line.history',
  })

  const EVERY_OPTIONS: [number, string][] = [
    [1, 'Every tick'],
    [2, 'Every 2nd tick'],
    [4, 'Every 4th tick'],
    [5, 'Every 5th tick'],
    [10, 'Every 10th tick'],
    [0, 'No numbers'],
  ]
  const RANGE_FIELDS = [
    ['from', 'From'],
    ['to', 'To'],
    ['step', 'Count by'],
  ] as const

  const lineSummary = $derived.by(() => {
    const { from, to, step } = line.range
    const n = (v: number) => niceText(v, line.numbering)
    return [
      `${n(from)} to ${n(to)}`,
      `by ${n(step)}`,
      clean.every ? (clean.every === 1 ? 'numbered' : `numbered every ${clean.every}`) : 'unnumbered',
    ].join(' · ')
  })

  function applyPreset(preset: Settings) {
    settings = withRow(cleanSettings($state.snapshot(preset)))
  }

  let svg = $state<SVGSVGElement>()
  const filename = 'number-line'
</script>

<div class="page no-print">
  <h1 class="visually-hidden">Number Line Generator</h1>
  <div class="layout">
    <div class="controls">
      <section class="card">
        <h2 class="card-head">Presets</h2>
        <Presets store={presetStore} same={sameFigure} settings={clean} onapply={applyPreset} />
      </section>

      <section class="card equations">
        <div class="head-row">
          <h2 class="card-head flush">Equations</h2>
          <HelpTip id="equation-tip" label="How to type an equation">
            Try x &lt; −1 or x ≥ 3, x ≠ 2, all real numbers or no solution, points like 3 or −1, 2.5, π/2, or a sequence like
            aₙ = 1/n. Type &lt;= for ≤, != for ≠, pi for π, / for a fraction and a_n for aₙ. Leave it empty for a blank line.
          </HelpTip>
        </div>
        {#each settings.equations as row, i}
          {@const read = line.rows[i]}
          <div class="row">
            <RowStyle {row} id="eq-{i}-style" label="equation {i + 1}" isPoints={!!read?.points || !!read?.sequence} colorOnly />
            <MathInput
              kind="inequality"
              id="eq-{i}"
              aria-label="Equation {i + 1}"
              placeholder={i === 0 ? '−2 < x ≤ 5' : ''}
              aria-invalid={!!read?.problem}
              aria-describedby={read?.problem ? `eq-${i}-problem` : undefined}
              bind:value={row.text}
            />
            <button class="icon-btn" aria-label="Remove equation {i + 1}" data-tip="Remove" onclick={() => removeRow(i)}><X size={17} /></button>
          </div>
          {#if read?.sequence || read?.points}
            <div class="row-extra">
              {#if read.sequence}
                <span class="terms">
                  n from
                  <input type="number" step="1" aria-label="Equation {i + 1}: first n" bind:value={row.first} />
                  to
                  <input type="number" step="1" aria-label="Equation {i + 1}: last n" bind:value={row.last} />
                </span>
              {/if}
              <label class="names">
                Names
                <input type="text" placeholder="A, B, C" aria-label="Equation {i + 1}: point names" bind:value={row.names} />
              </label>
            </div>
          {/if}
          {#if read?.problem}<p id="eq-{i}-problem" class="help problem">{read.problem}</p>{/if}
          {#if read?.note}<p class="help">{read.note}</p>{/if}
        {/each}
        <button class="add" onclick={addRow}><Plus size={16} aria-hidden="true" /> Add equation</button>
      </section>

      <section class="card sections">
        <Section title="Line" icon={Ruler} summary={lineSummary}>
          <div class="range-fields">
            {#each RANGE_FIELDS as [key, name]}
              <div class="range-field">
                <label for="range-{key}">{name}</label>
                <MathInput id="range-{key}" aria-invalid={!!line.problems[key]} bind:value={settings[key]} />
              </div>
            {/each}
          </div>
          {#each RANGE_FIELDS as [key]}
            {#if line.problems[key]}<p class="help problem">{line.problems[key]}</p>{/if}
          {/each}
          <label class="field">
            Numbers
            <select bind:value={settings.every}>
              {#each EVERY_OPTIONS as [v, label]}<option value={v}>{label}</option>{/each}
            </select>
          </label>
        </Section>
      </section>
    </div>

    <div class="preview">
      <FigureCanvas {svg} {filename} {history}>
        <NumberLine settings={clean} bind:svg />
      </FigureCanvas>
    </div>
  </div>
</div>

<!-- What actually prints: just the number line, across the page. -->
<div class="print-sheet">
  <NumberLine settings={clean} id="p" />
</div>

<style>
  .page { padding: 1.25rem 1.25rem 1rem; }

  .layout { display: grid; grid-template-columns: minmax(0, 24rem) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: minmax(0, 1fr); } }

  .controls { display: flex; flex-direction: column; gap: 1rem; }
  .controls > :global(*) { flex-shrink: 0; }

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
  .card-head.flush { padding: 0; }
  .sections { overflow: hidden; }

  .equations { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; }
  .row { display: flex; align-items: center; gap: 0.25rem; }
  .row > :global(.caret-field) { flex: 1; min-width: 0; margin-right: 0.2rem; }
  .equations .help { margin: -0.2rem 0 0; }
  /* Under a points or sequence row, lined up with its math field. */
  .row-extra {
    display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 0.9rem; margin: -0.15rem 0 0 calc(2.86rem + 0.25rem);
    font-size: 0.85rem; font-weight: 600; color: var(--muted);
  }
  .terms, .names { display: inline-flex; align-items: center; gap: 0.35rem; }
  .terms input { width: 3.6rem; }
  .names { flex: 1; min-width: 9rem; }
  .names input { flex: 1; min-width: 0; }
  .add {
    align-self: flex-start; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.6rem;
    border: 1.5px dashed var(--border); border-radius: 999px; background: none; color: var(--blue-dark); font-weight: 700; font-size: 0.85rem;
  }
  .add:hover { background: var(--blue-soft); }
  .help { margin: 0.45rem 0 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }

  .range-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.6rem; }
  .range-field { display: flex; flex-direction: column; gap: 0.3rem; font-weight: 600; font-size: 0.88rem; min-width: 0; }
  .range-fields { margin-bottom: 0.75rem; }
  .range-fields ~ .help { margin: -0.3rem 0 0.75rem; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; }
  .field:last-child { margin-bottom: 0; }

  .print-sheet { display: none; }
  @media print {
    @page { size: letter portrait; margin: 0.5in; }
    .print-sheet { display: block; width: 7.5in; break-inside: avoid; }
    .print-sheet :global(svg) { width: 100%; height: auto; }
  }
</style>
