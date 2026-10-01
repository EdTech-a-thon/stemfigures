<script lang="ts">
  // Pedigree: a random family for an inheritance mode, or a classic one, in
  // one click, then changed by hand by clicking anyone in it. The family is
  // checked against every mode, so the teacher sees how students can tell
  // which it is, and is warned when a change makes it impossible.
  import { tick } from 'svelte'
  import { Dices, GitFork, Shapes, Tags, Type } from '@lucide/svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import Section from '$shared/Section.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import FigureTextSettings from '$lib/shared/FigureTextSettings.svelte'
  import { CLASSICS, type Classic } from './classics'
  import { verdicts, verdictText } from './clues'
  import { formatFamily, personAt, refKey, type Member, type Ref } from './family'
  import { answerText, pedigreeFigure } from './figure'
  import { MODE_NAMES, MODES, type Mode } from './genetics'
  import PedigreeFigure from './PedigreeFigure.svelte'
  import PersonEditor from './PersonEditor.svelte'
  import { SIZES, type Size } from './random'
  import { familyOf, newSeed, pedigreeSettings, type CarrierStyle, type GenotypeRow } from './settings'

  const gen = generatorState(pedigreeSettings, 'pedigree')
  const s = gen.s
  let svg = $state<SVGSVGElement>()

  const family = $derived(familyOf(s))
  const fig = $derived(pedigreeFigure(s, family))
  const names = $derived(new Map(fig.layout.people.map((p) => [p.key, p.name])))
  const carriersShown = $derived(s.carriers !== 'none')
  const mode = $derived(s.mode as Mode)
  const results = $derived(verdicts(family, (key) => names.get(key) ?? key, carriersShown))
  const own = $derived(results.find((v) => v.mode === mode)!)
  const others = $derived(results.filter((v) => v.mode !== mode))
  const clear = $derived(own.verdict !== 'ruled out' && others.every((v) => v.verdict !== 'fits'))
  const classic = $derived(CLASSICS.find((c) => c.family === s.family && c.mode === s.mode))

  let selected = $state<Ref | null>(null)
  /** The selection, while that person is still in the family (undo can take them away). */
  const picked = $derived(selected && personAt(family, selected) ? selected : null)

  const SIZE_NAMES: Record<Size, string> = { small: 'Small', medium: 'Medium', large: 'Large' }
  const CARRIER_NAMES: Record<CarrierStyle, string> = { none: 'Hidden', half: 'Half filled', dot: 'Center dot' }
  const GENOTYPE_NAMES: Record<GenotypeRow, string> = { none: 'None', answers: 'Answers', blank: 'Blanks' }

  function newPedigree() {
    s.seed = newSeed()
    s.family = ''
    selected = null
  }

  /** A new random family for these generations or this size. */
  function reshape(change: () => void) {
    change()
    s.family = ''
    selected = null
  }

  function startFrom(c: Classic) {
    s.mode = c.mode
    s.letter = c.letter
    s.family = c.family
    s.titleMode = 'text'
    s.title = c.title
    selected = null
  }

  async function select(ref: Ref) {
    selected = ref
    await tick()
    // The person's settings are below the family's; bring them into view.
    const editor = document.getElementById('pedigree-person')
    editor?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    editor?.querySelector<HTMLElement>('button[aria-checked="true"]')?.focus({ preventScroll: true })
  }

  function change(next: { family: Member; select: Ref | null }) {
    s.family = formatFamily(next.family)
    selected = next.select
  }

  const familySummary = $derived(
    s.family ? (classic ? classic.name : `Changed by hand, ${MODE_NAMES[mode].toLowerCase()}`) : `${MODE_NAMES[mode]}, ${s.generations} generations`,
  )
  const symbolsSummary = $derived(`Carriers ${CARRIER_NAMES[s.carriers].toLowerCase()}`)
  const labelsSummary = $derived(
    [s.genotypes !== 'none' && `Genotypes: ${GENOTYPE_NAMES[s.genotypes].toLowerCase()}`, s.numerals && 'Generations', s.numbers && 'Numbers', s.key && 'Key']
      .filter(Boolean)
      .join(', ') || 'None',
  )
</script>

<GeneratorPage name="Pedigree" filename="pedigree" settingsWidth={26} printWidth={Math.min(7.5, Math.max(3.5, fig.width / 85))} {gen} {svg}>
  {#snippet inputs()}
    <div class="family">
      <h2><GitFork size={18} aria-hidden="true" /> Family</h2>
      <p class="summary">{familySummary}</p>

      <label class="field">
        <span>Inheritance</span>
        <select bind:value={s.mode}>
          {#each MODES as m (m)}<option value={m}>{MODE_NAMES[m]}</option>{/each}
        </select>
      </label>
      <div class="pair">
        <div class="field">
          <span id="pedigree-generations">Generations</span>
          <div class="segmented" role="radiogroup" aria-labelledby="pedigree-generations">
            {#each [2, 3, 4] as n (n)}
              <button type="button" role="radio" aria-checked={s.generations === n} class:on={s.generations === n} onclick={() => reshape(() => (s.generations = n))}>{n}</button>
            {/each}
          </div>
        </div>
        <div class="field">
          <span id="pedigree-size">Family size</span>
          <div class="segmented" role="radiogroup" aria-labelledby="pedigree-size">
            {#each SIZES as size (size)}
              <button type="button" role="radio" aria-checked={s.size === size} class:on={s.size === size} onclick={() => reshape(() => (s.size = size))}>{SIZE_NAMES[size]}</button>
            {/each}
          </div>
        </div>
      </div>
      <button type="button" class="btn-primary new" onclick={newPedigree}><Dices size={19} aria-hidden="true" /> New pedigree</button>
      {#if s.family}
        <p class="note">
          {classic ? `The ${classic.name.toLowerCase()} family.` : 'Changed by hand.'} New pedigree, or a change of generations or size,
          starts a random family; changing the inheritance keeps this one.
        </p>
      {/if}

      <p class="field-label">Or start from a classic</p>
      <div class="classics">
        {#each CLASSICS as c (c.id)}
          <button type="button" class="chip small" class:on={classic?.id === c.id} onclick={() => startFrom(c)}>{c.name}</button>
        {/each}
      </div>

      {#if own.verdict === 'ruled out'}
        <p class="warning" role="status">
          This family can’t be {MODE_NAMES[mode].toLowerCase()}.{own.reason ? ` ${own.reason}` : ''}
          {fig.labels.size === 0 && s.genotypes === 'answers' ? ' Genotypes are left off until it fits.' : ''}
        </p>
      {/if}
      <details class="tells">
        <summary>{clear ? 'Students can tell it’s ' : 'Students can’t be sure it’s '}{MODE_NAMES[mode].toLowerCase()}</summary>
        <ul>
          {#each others as v (v.mode)}<li class={v.verdict.replace(' ', '-')}>{verdictText(v)}</li>{/each}
        </ul>
        <p class="note">
          Read from the shading{carriersShown ? ' and carriers' : ''} as drawn, with the trait rare among people who married in.
        </p>
      </details>

      {#if picked}
        <PersonEditor
          {family}
          at={picked}
          name={names.get(refKey(picked)) ?? ''}
          {carriersShown}
          onchange={change}
          onclose={() => (selected = null)}
        />
      {:else}
        <label class="field pick">
          <span>Change someone</span>
          <select value="" onchange={(e) => {
            const p = fig.layout.people.find((x) => x.key === e.currentTarget.value)
            if (p) select(p.ref)
          }}>
            <option value="" disabled selected>Click them in the pedigree, or pick here</option>
            {#each [...fig.layout.people].sort((a, b) => a.generation - b.generation || a.x - b.x) as p (p.key)}
              <option value={p.key}>{p.name}</option>
            {/each}
          </select>
        </label>
      {/if}
    </div>
  {/snippet}

  {#snippet settings()}
    <Section title="Symbols" summary={symbolsSummary} icon={Shapes}>
      <p class="field-label first">Carriers</p>
      <div class="segmented" role="radiogroup" aria-label="Carriers">
        {#each Object.entries(CARRIER_NAMES) as [value, label] (value)}
          <button type="button" role="radio" aria-checked={s.carriers === value} class:on={s.carriers === value} onclick={() => (s.carriers = value as CarrierStyle)}>{label}</button>
        {/each}
      </div>
      <p class="note">
        {s.carriers === 'none'
          ? 'Carriers look unaffected, as students usually see them.'
          : mode === 'ad' || mode === 'xd' || mode === 'y'
            ? 'A dominant or Y-linked trait has no carriers.'
            : 'Heterozygotes who don’t show the trait.'}
      </p>
    </Section>
    <Section title="Labels" summary={labelsSummary} icon={Tags}>
      <p class="field-label first">Genotypes under each person</p>
      <div class="segmented" role="radiogroup" aria-label="Genotypes">
        {#each Object.entries(GENOTYPE_NAMES) as [value, label] (value)}
          <button type="button" role="radio" aria-checked={s.genotypes === value} class:on={s.genotypes === value} onclick={() => (s.genotypes = value as GenotypeRow)}>{label}</button>
        {/each}
      </div>
      <p class="note">
        {s.genotypes === 'answers'
          ? 'What students can work out from the pedigree, with a blank where an allele can’t be told (A_).'
          : s.genotypes === 'blank'
            ? 'A line under each person for students to write the genotype.'
            : 'No genotypes.'}
      </p>
      <label class="field letter">
        <span>Allele letter</span>
        <input type="text" maxlength="1" value={s.letter} oninput={(e) => /^[a-z]$/i.test(e.currentTarget.value) && (s.letter = e.currentTarget.value.toUpperCase())} />
      </label>
      <label class="check"><input type="checkbox" bind:checked={s.numerals} /> <span><strong>Generation numerals</strong><small>I, II, III down the left.</small></span></label>
      <label class="check"><input type="checkbox" bind:checked={s.numbers} /> <span><strong>Individual numbers</strong><small>1, 2, 3 under each person, left to right.</small></span></label>
      <label class="check"><input type="checkbox" bind:checked={s.key} /> <span><strong>Key</strong><small>What each symbol means, below the pedigree.</small></span></label>
    </Section>
    <Section title="Chart title" summary={s.titleMode === 'text' && s.title ? `“${s.title}”` : 'No title'} icon={Type}>
      <FigureTextSettings bind:titleMode={s.titleMode} bind:title={s.title} bind:answerKey={s.answerKey} answer={answerText(mode)} />
    </Section>
  {/snippet}

  {#snippet figure()}
    <PedigreeFigure settings={s} {family} selected={picked} onselect={select} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .family { padding: 1rem 1.1rem 1.1rem; display: flex; flex-direction: column; gap: 0.7rem; }
  h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.05rem; font-weight: 800; }
  .summary { margin: -0.55rem 0 0; color: var(--muted); font-size: 0.86rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 700; }
  .field select, .field input { font-weight: 400; }
  .pair { display: grid; grid-template-columns: auto 1fr; gap: 0.75rem; }
  .pair .segmented button { padding-inline: 0.55rem; }
  .new { width: 100%; }
  .classics { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .small { padding: 0.35rem 0.7rem; font-size: 0.84rem; }
  .field-label { margin: 0.2rem 0 -0.35rem; font-weight: 700; font-size: 0.9rem; }
  .field-label.first { margin: 0.35rem 0 0.45rem; }
  .note { margin: 0; color: var(--muted); font-size: 0.82rem; }
  :global(.section) .note { margin-top: 0.5rem; }
  .warning { margin: 0; padding: 0.55rem 0.75rem; border-radius: 10px; background: var(--red-soft); color: #991b1b; font-size: 0.85rem; }
  .tells { font-size: 0.86rem; border: 1px solid var(--border); border-radius: 10px; padding: 0.5rem 0.75rem; }
  .tells summary { cursor: pointer; font-weight: 700; }
  .tells ul { margin: 0.5rem 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; }
  .tells .fits { color: #92400e; }
  .tells .note { font-size: 0.78rem; }
  .letter { margin-top: 0.9rem; flex-direction: row; align-items: center; gap: 0.6rem; }
  .letter input { width: 3rem; text-align: center; }
  .check { display: flex; align-items: flex-start; gap: 0.6rem; margin-top: 0.9rem; cursor: pointer; }
  .check input { width: 1.1rem; height: 1.1rem; margin: 0.15rem 0 0; accent-color: var(--blue); }
  .check span { display: flex; flex-direction: column; }
  .check strong { font-size: 0.9rem; }
  .check small { color: var(--muted); font-size: 0.82rem; }
</style>
