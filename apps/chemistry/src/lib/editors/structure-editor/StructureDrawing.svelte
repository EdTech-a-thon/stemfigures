<script lang="ts">
  // A structure's bonds and atom symbols, in page coordinates. While editing,
  // each atom and bond gets a wider invisible target to press, and selected
  // atoms a highlight; those are marked data-no-export so they stay out of
  // copied and downloaded pictures.
  import { bondLines, BOND_NAMES, FONT, type Atom, type Bond, type Structure } from './structure'

  interface Props {
    structure: Structure
    /** atoms to highlight, and whether as selected or about to be deleted */
    selected?: string[]
    deleting?: boolean
    /** the atom a bond is being drawn from */
    bondStart?: string | null
    onatomdown?: (event: PointerEvent, atom: Atom) => void
    onbonddown?: (event: PointerEvent, bond: Bond) => void
  }
  let { structure, selected = [], deleting = false, bondStart = null, onatomdown, onbonddown }: Props = $props()

  const INK = '#111'
  const editing = $derived(!!onatomdown)
  const byId = $derived(new Map(structure.atoms.map((a) => [a.id, a])))
</script>

{#each structure.bonds as bond (bond.id)}
  {@const a = byId.get(bond.a)}
  {@const b = byId.get(bond.b)}
  {#if a && b}
    <g class="bond" role="presentation" onpointerdown={(e) => onbonddown?.(e, bond)}>
      {#if editing}
        <line data-no-export x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" stroke-width="24">
          <title>{BOND_NAMES[bond.order]} bond</title>
        </line>
      {/if}
      {#each bondLines(a, b, bond.order) as l, i (i)}
        <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={INK} stroke-width="2.5" stroke-linecap="round" />
      {/each}
    </g>
  {/if}
{/each}

{#each structure.atoms as atom (atom.id)}
  <g class="atom" role="presentation" onpointerdown={(e) => onatomdown?.(e, atom)}>
    {#if editing}
      <circle
        data-no-export
        cx={atom.x}
        cy={atom.y}
        r="21"
        fill={selected.includes(atom.id) ? (deleting ? 'var(--red-soft)' : '#dbeafe') : 'transparent'}
        stroke={selected.includes(atom.id) ? (deleting ? 'var(--red)' : 'var(--blue)') : bondStart === atom.id ? 'var(--amber)' : 'none'}
        stroke-width="2"
      />
    {/if}
    <text x={atom.x} y={atom.y} dy="0.35em" text-anchor="middle" font-size={FONT} fill={INK}>{atom.element}</text>
  </g>
{/each}

<style>
  .atom text { user-select: none; }
</style>
