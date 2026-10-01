<script lang="ts">
  // The Micropipette Reading generator: pick a micropipette, type the volume
  // it's set to, and get a figure students read the volume from its display.
  // Settings live in the page address.
  import { Palette, Pipette, Ruler, Tags, Type, ZoomIn } from '@lucide/svelte'
  import FigureTextSettings from '$shared/FigureTextSettings.svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import Section from '$shared/Section.svelte'
  import { generatorState } from '$shared/generatorState.svelte'
  import { MAGNIFIER_VIEWS, MAGNIFIER_VIEW_NAMES } from '$shared/magnify'
  import PipetteFigure from './PipetteFigure.svelte'
  import VolumeField from './VolumeField.svelte'
  import { MODELS, carryVolume, pipette, randomVolume, volumeText, type Model } from './pipette'
  import { PART_LABELS, QUICK_PICKS, answerLine, digitsText, pipetteSettings, type PartLabels } from './settings'

  const gen = generatorState(pipetteSettings, 'micropipette-reading')
  const s = gen.s
  let svg = $state<SVGSVGElement>()

  const p = $derived(pipette(s.model))
  const PART_LABEL_NAMES: Record<PartLabels, string> = { none: 'None', names: 'Names', blank: 'Blank lines' }

  const pipetteSummary = $derived([s.model, s.tip ? 'with a tip' : 'no tip'].join(', '))
  const readingSummary = $derived(`${volumeText(p, s.volume)}, reads ${digitsText(s)}`)
  const printSummary = $derived([s.color ? 'Color' : 'Black and white', s.decimalLine && p.red.includes(true) ? 'decimal line' : ''].filter(Boolean).join(', '))
  const textSummary = $derived(
    [s.titleMode === 'text' && s.title ? `“${s.title}”` : 'No title', s.answerKey ? 'answer key' : s.writeIn ? 'write-in line' : 'no answer'].join(', '),
  )

  /** Another pipette keeps the volume if it can be set to it, and otherwise starts from its own example. */
  function changeModel(model: Model) {
    s.volume = carryVolume(pipette(model), s.volume)
    s.model = model
  }
</script>

<GeneratorPage name="Micropipette Reading" filename="micropipette-reading" settingsWidth={26} printHeight={7} {gen} {svg}>
  {#snippet settings()}
    <Section title="Micropipette" summary={pipetteSummary} icon={Pipette} open>
      <p class="field-label">Model</p>
      <div class="chips" role="radiogroup" aria-label="Model">
        {#each MODELS as model (model)}
          <button type="button" role="radio" aria-checked={s.model === model} class="chip" class:on={s.model === model} onclick={() => changeModel(model)}>
            {model}
          </button>
        {/each}
      </div>
      <p class="note">{p.model}: {p.min} to {p.max} µL. Its digits count {p.places.slice(0, 2).map((n) => `${n} µL`).join(', ')} and {p.places[2]} µL, top to bottom.</p>
      <label class="check"><input type="checkbox" bind:checked={s.tip} /> Tip on the end</label>
      <label class="check"><input type="checkbox" bind:checked={s.showModel} /> Model printed above the display</label>
    </Section>

    <Section title="Reading" summary={readingSummary} icon={Ruler} open>
      <VolumeField {p} volume={s.volume} onchange={(v) => (s.volume = v)} onrandom={() => (s.volume = randomVolume(p))} />
      <p class="field-label">Common settings</p>
      <div class="chips">
        {#each QUICK_PICKS as pick (pick.model + pick.volume)}
          {@const on = s.model === pick.model && s.volume === pick.volume}
          <button type="button" class="chip" class:on aria-pressed={on} onclick={() => ((s.model = pick.model), (s.volume = pick.volume))}>
            {pick.model} at {pick.volume} µL
          </button>
        {/each}
      </div>
    </Section>

    <Section title="Color" summary={printSummary} icon={Palette}>
      <div class="segmented" role="radiogroup" aria-label="Color">
        <button type="button" role="radio" aria-checked={s.color} class:on={s.color} onclick={() => (s.color = true)}>Red digits in red</button>
        <button type="button" role="radio" aria-checked={!s.color} class:on={!s.color} onclick={() => (s.color = false)}>Black and white</button>
      </div>
      <label class="check below"><input type="checkbox" bind:checked={s.decimalLine} /> Line where the red digits start</label>
      <p class="note">
        {#if p.red.includes(true)}
          Red digits show where the decimal point goes. The line keeps that clear on a black and white copy.
        {:else}
          A {p.model} has no red digits, so it has no line.
        {/if}
      </p>
    </Section>

    <Section title="Magnifier" summary={MAGNIFIER_VIEW_NAMES[s.view]} icon={ZoomIn}>
      <div class="segmented" role="radiogroup" aria-label="Show">
        {#each MAGNIFIER_VIEWS as v (v)}
          <button type="button" role="radio" aria-checked={s.view === v} class:on={s.view === v} onclick={() => (s.view = v)}>
            {MAGNIFIER_VIEW_NAMES[v]}
          </button>
        {/each}
      </div>
    </Section>

    <Section title="Part labels" summary={PART_LABEL_NAMES[s.parts]} icon={Tags}>
      <div class="segmented" role="radiogroup" aria-label="Part labels">
        {#each PART_LABELS as mode (mode)}
          <button type="button" role="radio" aria-checked={s.parts === mode} class:on={s.parts === mode} onclick={() => (s.parts = mode)}>
            {PART_LABEL_NAMES[mode]}
          </button>
        {/each}
      </div>
      <p class="note">
        {#if s.view === 'magnifier'}
          Labels go beside the whole pipette, so they don't show with the magnifier alone.
        {:else}
          The plunger button, tip ejector button, volume display, handle, tip ejector, shaft and tip, named or with a blank line for students.
        {/if}
      </p>
    </Section>

    <Section title="Title and answer" summary={textSummary} icon={Type}>
      <FigureTextSettings bind:titleMode={s.titleMode} bind:title={s.title} bind:answerKey={s.answerKey} answer={answerLine(s)} />
      {#if !s.answerKey}
        <label class="check write-in">
          <input type="checkbox" bind:checked={s.writeIn} />
          <span>
            <strong>Write-in line</strong>
            <small>Print “Volume: ______ µL” under the figure for students.</small>
          </span>
        </label>
      {/if}
    </Section>
  {/snippet}
  {#snippet figure()}
    <PipetteFigure settings={s} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .field-label { margin: 0.9rem 0 0.45rem; font-weight: 700; font-size: 0.9rem; }
  .field-label:first-child { margin-top: 0; }
  .note { margin: 0.6rem 0 0.8rem; font-size: 0.85rem; color: var(--muted); }
  .check { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
  .check:last-child { margin-bottom: 0; }
  .check input { width: 1.05rem; height: 1.05rem; margin: 0; accent-color: var(--blue); }
  .below { margin-top: 0.9rem; }
  .segmented button { font-size: 0.8rem; }
  .write-in { align-items: flex-start; gap: 0.6rem; margin-top: 1rem; }
  .write-in input { width: 1.1rem; height: 1.1rem; margin-top: 0.15rem; }
  .write-in span { display: flex; flex-direction: column; }
  .write-in strong { font-size: 0.9rem; }
  .write-in small { color: var(--muted); font-size: 0.82rem; font-weight: 400; }
</style>
