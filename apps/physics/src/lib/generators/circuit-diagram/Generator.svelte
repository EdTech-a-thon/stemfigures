<script lang="ts">
  // The Circuit Diagram Generator: the circuit and its style on the left, the
  // figure on the right. Settings live in the page address.
  import { CircuitBoard, Heading, Palette } from '@lucide/svelte'
  import Choice from '$lib/shared/Choice.svelte'
  import { createGenerator } from '$lib/shared/generator.svelte'
  import FigureOptions from '$lib/shared/FigureOptions.svelte'
  import GeneratorPage from '$shared/GeneratorPage.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import Section from '$lib/shared/Section.svelte'
  import CircuitDiagram from './CircuitDiagram.svelte'
  import Outline from './Outline.svelte'
  import { circuitSettings } from './settings'
  import { partsOf, type Item } from './tree'

  const gen = createGenerator(circuitSettings, 'circuit-diagram')
  const s = $derived(gen.snapshot())

  const countGroups = (items: Item[]): number => items.reduce((n, i) => (i.type === 'part' ? n : n + 1 + countGroups(i.items)), 0)
  const circuitSummary = $derived.by(() => {
    const parts = [...partsOf(s.circuit.items)].length
    const groups = countGroups(s.circuit.items)
    return `${parts} part${parts === 1 ? '' : 's'}${groups ? ` · ${groups} group${groups === 1 ? '' : 's'}` : ''}`
  })

  const styleSummary = $derived(`${s.symbols === 'us' ? 'US' : 'IEC'} symbols${s.polarity ? ' · + and − marks' : ''}`)
  const titleSummary = $derived(s.title.mode === 'text' ? `“${s.title.text}”` : s.title.mode === 'blank' ? 'blank' : 'none')
</script>

<GeneratorPage name="Circuit Diagram Generator" filename="circuit-diagram" {gen}>
  {#snippet settings()}
    <Section title="Circuit" icon={CircuitBoard} summary={circuitSummary}>
      <Outline circuit={gen.s.circuit} onedit={(next) => (gen.s.circuit = next)} />
    </Section>

    <Section title="Symbols" icon={Palette} summary={styleSummary}>
      <div class="field">
        Symbol style
        <Choice name="Symbol style" options={[['us', 'US (zigzag resistor)'], ['iec', 'IEC (box resistor)']]} bind:value={gen.s.symbols} />
      </div>
      <label class="check"><input type="checkbox" bind:checked={gen.s.polarity} /> + and − beside each battery</label>
    </Section>

    <Section title="Chart title" icon={Heading} summary={titleSummary}>
      <div class="field"><LabelField name="Chart title" placeholder="Title" bind:label={gen.s.title} /></div>
    </Section>
    <FigureOptions bind:mirror={gen.s.mirror} bind:color={gen.s.color} />
  {/snippet}

  {#snippet figure()}
    <CircuitDiagram settings={s} id="f" />
  {/snippet}
</GeneratorPage>
