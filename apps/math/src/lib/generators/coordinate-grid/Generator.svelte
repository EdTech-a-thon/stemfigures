<script lang="ts">
  // The Coordinate Grid Generator: presets, what's graphed and collapsed settings on the left,
  // the figure card on the right. On a wide screen the page itself never
  // scrolls; only the settings column does. Settings are mirrored into the
  // page address so a bookmark or shared link brings back exactly this grid,
  // and the server renders that same grid on first load.
  import { Grid3x3, Heading, MoveRight, MoveUp, Plus, X } from '@lucide/svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import { untrack } from 'svelte'
  import CapPicker from '$lib/shared/CapPicker.svelte'
  import type { Cap } from '$lib/shared/caps.js'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import { niceText } from '$lib/shared/numbering.js'
  import RowStyle from '$lib/shared/RowStyle.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { ROW_DEFAULTS, readEquations, type Row } from './equations.js'
  import Graph from './Graph.svelte'
  import {
    ANGLE_UNITS, CAPS, GRAPH_KEYS, cleanSettings, readAxes, settingsFromParams, settingsToQuery, type AxisName, type RawSettings, type Settings,
  } from './settings.js'

  // There's always a row to type the next equation in.
  const blankRow = (): Row => ({ ...ROW_DEFAULTS })
  const withRow = (s: Settings): Settings => (s.equations.length ? s : { ...s, equations: [blankRow()] })

  // A preset keeps only what draws the graph. Undo history and presets keep
  // the names they were first saved under.
  const graphOnly = (s: Settings) => Object.fromEntries(GRAPH_KEYS.map((k) => [k, s[k]])) as Settings
  const gen = generatorState(
    {
      tidy: (s) => withRow(graphOnly(cleanSettings(s as RawSettings))),
      fromParams: (params) => withRow(settingsFromParams(params)),
      toQuery: settingsToQuery,
      keyOf: settingsToQuery,
    },
    'coordinate-grid',
    { history: 'mathfigures.coordinate-grid.history', presets: 'mathfigures.coordinate-grid.presets' },
  )
  const s = gen.s
  const clean = $derived(gen.snapshot())
  const axes = $derived(readAxes(clean))
  const rows = $derived(
    readEquations(clean.equations.map((r) => r.text), {
      x0: axes.x.start, x1: axes.x.start + axes.x.blocks * axes.x.step,
      y0: axes.y.start, y1: axes.y.start + axes.y.blocks * axes.y.step,
    }, clean.angle),
  )
  // The angle unit only matters, so only shows (with the x-axis, whose values
  // trig reads), once a row uses trig.
  const usesTrig = $derived(clean.equations.some((r) => /sin|cos|tan|sec|csc|cot/.test(r.text)))
  // Typing ° into the x-axis range switches trig to degrees, and taking it out
  // switches back, so the axis and the graph agree. The setting can still be
  // changed by hand afterwards (degrees on an axis numbered 0, 90, 180…).
  const xInDegrees = $derived(/°/.test(`${s.xFrom}${s.xTo}${s.xStep}`))
  let wasInDegrees = untrack(() => xInDegrees)
  $effect(() => {
    if (xInDegrees === wasInDegrees) return
    wasInDegrees = xInDegrees
    s.angle = xInDegrees ? 'degrees' : 'radians'
  })

  // A new row, unless the last one is still empty, which gets the focus instead.
  function addRow() {
    if (s.equations.at(-1)?.text.trim() !== '') s.equations.push(blankRow())
    const i = s.equations.length - 1
    requestAnimationFrame(() => document.getElementById(`eq-${i}`)?.focus())
  }
  function removeRow(i: number) {
    s.equations.splice(i, 1)
    if (!s.equations.length) s.equations.push(blankRow())
  }

  const EVERY_OPTIONS: [number, string][] = [
    [1, 'Every line'],
    [2, 'Every 2nd line'],
    [5, 'Every 5th line'],
    [10, 'Every 10th line'],
    [0, 'No numbers'],
  ]
  const MINOR_OPTIONS: [number, string][] = [
    [0, 'None'],
    [2, '2 per block'],
    [4, '4 per block'],
    [5, '5 per block'],
  ]
  const gridSummary = $derived(clean.minor ? `${clean.minor} minor gridlines per block` : 'No minor gridlines')
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
      axis === 'x' && usesTrig ? `trig in ${clean.angle}` : '',
      every ? (every === 1 ? 'numbered' : `numbered every ${every}`) : 'unnumbered',
      clean[`${axis}LabelMode` as const] === 'text' && clean[`${axis}Label` as const].trim() ? `“${clean[`${axis}Label` as const].trim()}”` : 'no label',
      endsSummary(clean[`${axis}StartCap` as const], clean[`${axis}EndCap` as const]),
    ]
      .filter(Boolean)
      .join(' · ')
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

  let svg = $state<SVGSVGElement>()
  const filename = $derived(
    (clean.titleMode === 'text' && clean.title.trim() ? clean.title.trim() : 'coordinate-grid')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'coordinate-grid',
  )

</script>

<GeneratorPage name="Coordinate Grid Generator" {filename} {gen} {svg} bind:labelSize={s.labelSize} printHeight={9.8}>
  {#snippet inputs()}
    <section class="equations">
      <div class="head-row">
        <h2 class="card-head">Equations</h2>
        <HelpTip id="equation-tip" label="How to type an equation">
          Type a line like y = 2x + 1, 2x + 3y = 6 or x = 4, a curve like y = x^2 − 4 or y = −(x − 2)^2 + 3, or points like
          (2, 3) or (1, 2), (3, 4). To draw only part of a line, give its domain after a comma: y = 3x, −5 ≤ x &lt; 7 (≤ for a
          closed circle, &lt; for an open one); a piecewise function is a row for each piece. Name points by writing a letter
          first: A(1, 2), B'(3, 4). Functions work too: sin, cos,
          tan, sec, csc, cot, arcsin, ln, log, log_2 (type _ for the base), e^x and |x|. Type ^ for an exponent, / for a fraction
          and pi for π.
        </HelpTip>
      </div>
      {#each s.equations as row, i}
        <div class="row">
          <RowStyle {row} id="eq-{i}-style" label="equation {i + 1}" isPoints={!!rows[i]?.points} hasDomain={!!rows[i]?.circles?.some((c) => c.end)}
            hasAsymptotes={!!rows[i]?.asymptotes?.length}
          />
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
  {/snippet}

  {#snippet settings()}
    <Section title="Titles" icon={Heading} summary={titlesSummary}>
      {#each TITLES as { key, name, placeholder }}
        <div class="field">
          <span>{name}</span>
          <LabelField {name} {placeholder} bind:mode={s[`${key}Mode` as const]} bind:text={s[key]} />
        </div>
      {/each}
    </Section>

    {#each AXES as { axis, heading, icon, ends }}
      <Section title={heading} {icon} summary={axisSummary(axis)}>
        <div class="grid-fields">
          {#each RANGE_FIELDS as [key, name]}
            <div class="range-field">
              <label for="{axis}-{key}">{name}</label>
              <MathInput id="{axis}-{key}" aria-invalid={!!axes.problems[`${axis}${key}`]} bind:value={s[`${axis}${key}` as const]} />
            </div>
          {/each}
        </div>
        {#each RANGE_FIELDS as [key]}
          {#if axes.problems[`${axis}${key}`]}<p class="help problem">{axes.problems[`${axis}${key}`]}</p>{/if}
        {/each}
        {#if axis === 'x' && (usesTrig || clean.angle !== 'radians')}
          <label class="field">
            <span>Trig reads x in <span class="hint">type ° (or deg) in the range for degrees</span></span>
            <select bind:value={s.angle}>
              {#each Object.entries(ANGLE_UNITS) as [v, label]}<option value={v}>{label}</option>{/each}
            </select>
          </label>
        {/if}
        <label class="field">
          Numbers
          <select bind:value={s[`${axis}Every` as const]}>
            {#each EVERY_OPTIONS as [v, label]}<option value={v}>{label}</option>{/each}
          </select>
        </label>
        <div class="field">
          <span>Label <span class="hint">at the {axis === 'x' ? 'right' : 'top'} end</span></span>
          <LabelField
            name="{heading} label"
            placeholder={axis}
            blank={false}
            bind:mode={s[`${axis}LabelMode` as const]}
            bind:text={s[`${axis}Label` as const]}
          />
        </div>
        <div class="ends">
          {#each ends as [key, name, direction]}
            <div class="field">
              <span>{name}</span>
              <CapPicker options={CAPS} label="{heading} {name.toLowerCase()}" {direction} bind:value={s[`${axis}${key}Cap` as const]} />
            </div>
          {/each}
        </div>
      </Section>
    {/each}

    <Section title="Grid" icon={Grid3x3} summary={gridSummary}>
      <label class="field">
        Minor gridlines
        <select bind:value={s.minor}>
          {#each MINOR_OPTIONS as [v, label]}<option value={v}>{label}</option>{/each}
        </select>
      </label>
    </Section>
  {/snippet}

  {#snippet figure()}
    <Graph settings={clean} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }

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
</style>
