<script lang="ts">
  // The Organic Structure Editor: unlike the generators, there are no
  // settings to turn into a figure. The teacher drags atoms from the tray on
  // the left onto the grid on the right and joins them with bonds, in one of
  // three modes:
  //   Move:   drag an atom, or a box around several, then drag one to move them all
  //   Bond:   tap two atoms to join them; tap a bond for double, then triple
  //   Delete: tap an atom or bond, or drag a box around atoms, to remove them
  // The drawing is kept in this browser (nothing goes in the address), with
  // undo and redo, and exports cropped to just the structure.
  import { Copy, Eraser, FileDown, ImageDown, Link2, MousePointer2, Redo2, Trash2, Undo2 } from '@lucide/svelte'
  import { onMount } from 'svelte'
  import { copyPng, downloadPng, downloadSvg } from '$lib/shared/exporting'
  import StructureDrawing from './StructureDrawing.svelte'
  import {
    atomsIn, bondBetween, BOND_NAMES, cropBox, describe, emptyStructure, freeSpot, GRID, groupShift,
    HEIGHT, MAIN_ELEMENTS, MORE_ELEMENTS, nextOrder, snap, tidyStructure, WIDTH, withoutAtoms,
    type Atom, type Bond, type ElementSymbol, type Structure,
  } from './structure'

  interface Props {
    name: string
  }
  let { name }: Props = $props()

  type Mode = 'move' | 'bond' | 'delete'
  const MODES: { mode: Mode; label: string; hint: string }[] = [
    { mode: 'move', label: 'Move', hint: 'Drag atoms to move them, or drag a box around several to move them together.' },
    { mode: 'bond', label: 'Bond', hint: 'Tap two atoms to join them. Tap a bond to make it double, then triple.' },
    { mode: 'delete', label: 'Delete', hint: 'Tap an atom or bond to delete it, or drag a box around atoms.' },
  ]
  const STORAGE_KEY = 'chemistry-structure-editor'
  const HISTORY_LIMIT = 100

  let structure = $state.raw<Structure>(emptyStructure())
  let past = $state.raw<Structure[]>([])
  let future = $state.raw<Structure[]>([])
  let mode = $state<Mode>('move')
  let selected = $state.raw<string[]>([])
  let bondStart = $state<string | null>(null)
  let showMore = $state(false)
  let message = $state('Drag an atom from the tray onto the grid to begin.')
  let svg = $state<SVGSVGElement>()

  // The drag in progress: a box being drawn, atoms being moved, or an atom
  // on its way from the tray.
  let box = $state<{ x1: number; y1: number; x2: number; y2: number; pointerId: number; keep: string[] } | null>(null)
  let moving = $state.raw<{ pointerId: number; x: number; y: number; origins: Map<string, { x: number; y: number }>; before: Structure; moved: boolean } | null>(null)
  let carrying = $state<{ element: ElementSymbol; pointerId: number; x: number; y: number; startX: number; startY: number } | null>(null)
  let loaded = false

  onMount(() => {
    try {
      structure = tidyStructure(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
      if (structure.atoms.length) message = 'Your last structure is back. Keep drawing, or clear the page for a new one.'
    } catch {
      /* nothing saved, or storage blocked */
    }
    loaded = true
  })

  $effect(() => {
    const data = JSON.stringify(structure)
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, data)
    } catch {
      /* storage blocked or full: the drawing lasts until the page closes */
    }
  })

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  function commit(next: Structure) {
    past = [...past, structure].slice(-HISTORY_LIMIT)
    future = []
    structure = next
  }
  function undo() {
    if (!past.length) return
    future = [structure, ...future]
    structure = past.at(-1)!
    past = past.slice(0, -1)
    bondStart = null
    selected = []
  }
  function redo() {
    if (!future.length) return
    past = [...past, structure]
    structure = future[0]
    future = future.slice(1)
    bondStart = null
    selected = []
  }

  function setMode(next: Mode) {
    mode = next
    bondStart = null
    if (next === 'bond') selected = []
    message = MODES.find((m) => m.mode === next)!.hint
  }

  /** A point on the page from a pointer's place on screen. */
  function pagePoint(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY).matrixTransform(svg!.getScreenCTM()!.inverse())
    return { x: Math.max(0, Math.min(WIDTH, p.x)), y: Math.max(0, Math.min(HEIGHT, p.y)) }
  }

  function addAtom(element: ElementSymbol, at: { x: number; y: number }) {
    commit({ ...structure, atoms: [...structure.atoms, { id: crypto.randomUUID(), element, ...at }] })
    message = mode === 'bond' ? `${element} placed. Tap two atoms to join them.` : `${element} placed. Drag it to move it, or switch to Bond to join it to another atom.`
  }

  function deleteAtoms(ids: string[]) {
    commit(withoutAtoms(structure, ids))
    selected = selected.filter((id) => !ids.includes(id))
    bondStart = null
    message = `${plural(ids.length, 'atom')} deleted.`
  }

  // ----- The tray: drag an atom out, or tap one (or press Enter) to drop it in the middle

  function pickUp(event: PointerEvent, element: ElementSymbol) {
    if (event.button !== 0) return
    event.preventDefault()
    showMore = false
    carrying = { element, pointerId: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }
  }
  function carry(event: PointerEvent) {
    if (!carrying || event.pointerId !== carrying.pointerId) return
    event.preventDefault()
    carrying = { ...carrying, x: event.clientX, y: event.clientY }
  }
  function drop(event: PointerEvent) {
    if (!carrying || event.pointerId !== carrying.pointerId) return
    const { element, startX, startY } = carrying
    carrying = null
    if (event.type === 'pointercancel' || !svg) return
    const r = svg.getBoundingClientRect()
    const over = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom
    const tapped = Math.hypot(event.clientX - startX, event.clientY - startY) < 6
    if (over) {
      const p = pagePoint(event.clientX, event.clientY)
      addAtom(element, snap(p.x, p.y))
    } else if (tapped) addAtom(element, freeSpot(structure))
  }
  /** A keyboard press on a tray button (a pointer's is handled by pickUp and drop). */
  function trayKey(event: MouseEvent, element: ElementSymbol) {
    if (event.detail !== 0) return
    showMore = false
    addAtom(element, freeSpot(structure))
  }

  // ----- The page

  function pressAtom(event: PointerEvent, atom: Atom) {
    event.stopPropagation()
    if (event.button !== 0) return
    if (mode === 'delete') return deleteAtoms([atom.id])
    if (mode === 'bond') return bondTo(atom)
    if (event.shiftKey) {
      selected = selected.includes(atom.id) ? selected.filter((id) => id !== atom.id) : [...selected, atom.id]
      return
    }
    const ids = selected.includes(atom.id) ? selected : [atom.id]
    const p = pagePoint(event.clientX, event.clientY)
    const origins = new Map(structure.atoms.filter((a) => ids.includes(a.id)).map((a) => [a.id, { x: a.x, y: a.y }]))
    moving = { pointerId: event.pointerId, ...p, origins, before: structure, moved: false }
    selected = ids
    svg!.setPointerCapture(event.pointerId)
  }

  function bondTo(atom: Atom) {
    if (!bondStart) {
      bondStart = atom.id
      message = `Now tap the atom to bond this ${atom.element} to.`
    } else if (bondStart === atom.id) {
      bondStart = null
      message = 'Bond cancelled.'
    } else if (bondBetween(structure, bondStart, atom.id)) {
      bondStart = null
      message = 'Those atoms are already bonded. Tap the bond to change it.'
    } else {
      commit({ ...structure, bonds: [...structure.bonds, { id: crypto.randomUUID(), a: bondStart, b: atom.id, order: 1 }] })
      bondStart = null
      message = 'Bonded. Tap the bond to make it double, then triple.'
    }
  }

  function pressBond(event: PointerEvent, bond: Bond) {
    if (mode === 'move' || event.button !== 0) return
    event.stopPropagation()
    if (mode === 'delete') {
      commit({ ...structure, bonds: structure.bonds.filter((b) => b.id !== bond.id) })
      message = 'Bond deleted.'
      return
    }
    const order = nextOrder(bond.order)
    commit({ ...structure, bonds: structure.bonds.map((b) => (b.id === bond.id ? { ...b, order } : b)) })
    message = `Now a ${BOND_NAMES[order]} bond.${order === 3 ? ' Tap again for single.' : ''}`
  }

  function pressPage(event: PointerEvent) {
    bondStart = null
    if (mode === 'bond' || event.button !== 0) return
    const p = pagePoint(event.clientX, event.clientY)
    box = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, pointerId: event.pointerId, keep: event.shiftKey ? selected : [] }
    if (!event.shiftKey) selected = []
    svg!.setPointerCapture(event.pointerId)
  }

  const boxed = (b: NonNullable<typeof box>) => [...new Set([...b.keep, ...atomsIn(structure, b)])]

  function movePointer(event: PointerEvent) {
    if (moving && event.pointerId === moving.pointerId) {
      const p = pagePoint(event.clientX, event.clientY)
      const { dx, dy } = groupShift([...moving.origins.values()], p.x - moving.x, p.y - moving.y)
      moving.moved ||= dx !== 0 || dy !== 0
      const origins = moving.origins
      structure = {
        ...structure,
        atoms: structure.atoms.map((a) => {
          const o = origins.get(a.id)
          return o ? { ...a, x: o.x + dx, y: o.y + dy } : a
        }),
      }
    } else if (box && event.pointerId === box.pointerId) {
      const p = pagePoint(event.clientX, event.clientY)
      box = { ...box, x2: p.x, y2: p.y }
      selected = boxed(box)
    }
  }

  function endPointer(event: PointerEvent) {
    const cancelled = event.type === 'pointercancel'
    if (moving && event.pointerId === moving.pointerId) {
      if (cancelled) structure = moving.before
      else if (moving.moved) {
        past = [...past, moving.before].slice(-HISTORY_LIMIT)
        future = []
        message = `${plural(moving.origins.size, 'atom')} moved.`
      }
      moving = null
    }
    if (!box || event.pointerId !== box.pointerId) return
    const ids = boxed(box)
    const dragged = Math.abs(box.x2 - box.x1) > 3 || Math.abs(box.y2 - box.y1) > 3
    if (cancelled) selected = box.keep
    else if (mode === 'delete' && dragged && ids.length) deleteAtoms(ids)
    else if (mode === 'move' && ids.length)
      message = `${plural(ids.length, 'atom')} selected. Drag one to move them together, or press Delete to remove them.`
    box = null
  }

  function keydown(event: KeyboardEvent) {
    const target = event.target as Element | null
    if (target?.matches?.('input, textarea, select')) return
    const key = event.key.toLowerCase()
    if ((event.metaKey || event.ctrlKey) && !event.altKey && (key === 'z' || key === 'y')) {
      event.preventDefault()
      if (key === 'y' || event.shiftKey) redo()
      else undo()
    } else if (event.key === 'Escape') {
      bondStart = null
      selected = []
      showMore = false
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && selected.length && mode !== 'bond') {
      event.preventDefault()
      deleteAtoms(selected)
    }
  }

  function clearPage() {
    if (!confirm('Clear the whole structure? You can undo this.')) return
    commit(emptyStructure())
    selected = []
    bondStart = null
    message = 'A fresh page. Drag an atom from the tray to begin.'
  }

  // ----- Getting the structure out, cropped to just the atoms and bonds

  /** The page as a picture of the structure alone. The grid, targets and
   *  highlights are marked data-no-export, and exporting leaves them out. */
  function picture() {
    const crop = cropBox(structure)
    if (!svg || !crop) {
      message = 'Add an atom before copying or downloading.'
      return null
    }
    const copy = svg.cloneNode(true) as SVGSVGElement
    copy.setAttribute('viewBox', `${crop.x} ${crop.y} ${crop.width} ${crop.height}`)
    copy.setAttribute('width', String(Math.ceil(crop.width)))
    copy.setAttribute('height', String(Math.ceil(crop.height)))
    copy.removeAttribute('class')
    copy.setAttribute('role', 'img')
    copy.setAttribute('aria-label', describe(structure))
    return copy
  }
  async function copyImage() {
    const p = picture()
    if (!p) return
    try {
      await copyPng(p)
      message = 'Image copied. Paste it into your document.'
    } catch {
      message = 'Your browser blocked copying. Try downloading a PNG instead.'
    }
  }
  function download(kind: 'png' | 'svg') {
    const p = picture()
    if (!p) return
    if (kind === 'png') downloadPng(p, 'organic-structure.png')
    else downloadSvg(p, 'organic-structure.svg')
    message = `Downloaded as ${kind.toUpperCase()}.`
  }
</script>

<svelte:window onkeydown={keydown} onpointermove={carry} onpointerup={drop} onpointercancel={drop} />

<div class="editor">
  <aside class="tools card no-print" aria-label="Drawing tools">
    <h1 class="visually-hidden">{name}</h1>
    <section>
      <h2>Atoms</h2>
      <p class="note">Drag one onto the grid, or tap it to add it in the middle.</p>
      <div class="tray">
        {#each MAIN_ELEMENTS as e (e.symbol)}
          <button
            type="button"
            class="element"
            aria-label="Add {e.name}"
            onpointerdown={(event) => pickUp(event, e.symbol)}
            onclick={(event) => trayKey(event, e.symbol)}
          >
            <strong>{e.symbol}</strong><span>{e.name}</span>
          </button>
        {/each}
      </div>
      <button type="button" class="more" aria-expanded={showMore} onclick={() => (showMore = !showMore)}>
        {showMore ? 'Fewer atoms' : 'More atoms'}
      </button>
      {#if showMore}
        <div class="more-atoms">
          {#each MORE_ELEMENTS as symbol (symbol)}
            <button
              type="button"
              class="element small"
              aria-label="Add {symbol}"
              onpointerdown={(event) => pickUp(event, symbol)}
              onclick={(event) => trayKey(event, symbol)}
            >
              <strong>{symbol}</strong>
            </button>
          {/each}
        </div>
      {/if}
    </section>

    <section>
      <h2>Mode</h2>
      <div class="segmented modes" role="radiogroup" aria-label="Mode">
        {#each MODES as m (m.mode)}
          <button type="button" role="radio" aria-checked={mode === m.mode} class:on={mode === m.mode} class:delete={m.mode === 'delete'} onclick={() => setMode(m.mode)}>
            {#if m.mode === 'move'}<MousePointer2 size={16} aria-hidden="true" />{:else if m.mode === 'bond'}<Link2 size={16} aria-hidden="true" />{:else}<Eraser size={16} aria-hidden="true" />{/if}
            {m.label}
          </button>
        {/each}
      </div>
      <p class="note">{MODES.find((m) => m.mode === mode)!.hint}</p>
    </section>

    <section class="keys">
      <h2>Shortcuts</h2>
      <p class="note">Shift-click to add atoms to a selection. Delete removes the selected atoms. Esc lets go of a bond or a selection. Ctrl+Z undoes.</p>
    </section>
  </aside>

  <div class="figure-side">
    <div class="card canvas">
      <div class="toolbar no-print" role="toolbar" aria-label="Structure actions">
        <button class="icon-btn" aria-label="Copy image" data-tip="Copy image" onclick={copyImage}><Copy size={19} /></button>
        <button class="icon-btn" aria-label="Download PNG" data-tip="Download PNG" onclick={() => download('png')}><ImageDown size={19} /></button>
        <button class="icon-btn" aria-label="Download SVG" data-tip="Download SVG" onclick={() => download('svg')}><FileDown size={19} /></button>
        <span class="divider"></span>
        <button class="icon-btn" aria-label="Undo" data-tip="Undo" disabled={!past.length} onclick={undo}><Undo2 size={19} /></button>
        <button class="icon-btn" aria-label="Redo" data-tip="Redo" disabled={!future.length} onclick={redo}><Redo2 size={19} /></button>
        <button class="icon-btn" aria-label="Clear the page" data-tip="Clear the page" disabled={!structure.atoms.length} onclick={clearPage}><Trash2 size={19} /></button>
        <p class="message" aria-live="polite">{message}</p>
      </div>
      <div class="sheet">
        <svg
          bind:this={svg}
          class="page {mode}"
          class:moving={!!moving}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 {WIDTH} {HEIGHT}"
          font-family="Arial, Helvetica, sans-serif"
          role="application"
          aria-label="Drawing page. {describe(structure)}."
          onpointerdown={pressPage}
          onpointermove={movePointer}
          onpointerup={endPointer}
          onpointercancel={endPointer}
        >
          <defs data-no-export>
            <pattern id="structure-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path d="M {GRID} 0 L 0 0 0 {GRID}" fill="none" stroke="#e3e4ea" stroke-width="1" />
            </pattern>
          </defs>
          <rect data-no-export width={WIDTH} height={HEIGHT} fill="#fff" />
          <rect data-no-export width={WIDTH} height={HEIGHT} fill="url(#structure-grid)" />
          <StructureDrawing
            {structure}
            selected={mode === 'bond' ? [] : selected}
            deleting={mode === 'delete'}
            {bondStart}
            onatomdown={pressAtom}
            onbonddown={pressBond}
          />
          {#if box}
            <rect
              data-no-export
              class="box"
              class:delete={mode === 'delete'}
              x={Math.min(box.x1, box.x2)}
              y={Math.min(box.y1, box.y2)}
              width={Math.abs(box.x2 - box.x1)}
              height={Math.abs(box.y2 - box.y1)}
            />
          {/if}
          {#if !structure.atoms.length}
            <g data-no-export class="empty" pointer-events="none">
              <text x={WIDTH / 2} y={HEIGHT / 2 - 8} text-anchor="middle" font-size="22" font-weight="700">Your structure will appear here</text>
              <text x={WIDTH / 2} y={HEIGHT / 2 + 24} text-anchor="middle" font-size="16">Drag C, H or O from the tray to get started.</text>
            </g>
          {/if}
        </svg>
      </div>
    </div>
  </div>
</div>

{#if carrying}
  <div class="carried" style:left="{carrying.x}px" style:top="{carrying.y}px" aria-hidden="true">{carrying.element}</div>
{/if}

<style>
  .editor { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; }
  .tools { display: flex; flex-direction: column; gap: 1.1rem; padding: 1rem 1.1rem 1.2rem; }
  h2 { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
  .note { margin: 0.35rem 0 0; color: var(--muted); font-size: 0.84rem; }

  .tray { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; margin-top: 0.7rem; }
  .element {
    display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
    padding: 0.55rem 0.3rem 0.5rem;
    border: 1.5px solid var(--border); border-radius: 12px; background: #fff; color: var(--ink);
    touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab;
    transition: border-color 0.15s, background 0.15s, transform 0.15s;
  }
  .element:hover { border-color: var(--blue-border); background: var(--blue-soft); transform: translateY(-1px); }
  .element strong { font-family: Arial, Helvetica, sans-serif; font-size: 1.5rem; line-height: 1.1; }
  .element span { color: var(--muted); font-size: 0.75rem; font-weight: 600; }
  .more { margin-top: 0.5rem; width: 100%; padding: 0.45rem; border: 1.5px dashed var(--blue-border); border-radius: 10px; background: transparent; color: var(--blue-dark); font-size: 0.86rem; font-weight: 600; }
  .more:hover { background: var(--blue-soft); }
  .more-atoms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.4rem; margin-top: 0.5rem; }
  .element.small { padding: 0.35rem 0.2rem; }
  .element.small strong { font-size: 1.15rem; }

  .modes { margin-top: 0.6rem; }
  .modes button.on.delete { color: var(--red); }

  .canvas { display: flex; flex-direction: column; }
  .toolbar { display: flex; align-items: center; gap: 0.3rem; padding: 0.45rem; border-bottom: 1px solid var(--border); }
  .divider { width: 1px; height: 1.6rem; background: var(--border); margin: 0 0.3rem; flex: none; }
  .message { flex: 1; min-width: 0; margin: 0 0.5rem 0 0.6rem; color: var(--muted); font-size: 0.86rem; text-align: right; }
  .sheet { padding: 0.75rem; display: flex; justify-content: center; }
  .page { display: block; width: 100%; height: auto; border-radius: 10px; touch-action: none; user-select: none; -webkit-user-select: none; }
  .page.move { cursor: crosshair; }
  .page.move :global(.atom) { cursor: grab; }
  .page.moving, .page.moving :global(.atom) { cursor: grabbing; }
  .page.bond :global(.atom), .page.bond :global(.bond) { cursor: pointer; }
  .page.delete, .page.delete :global(.atom), .page.delete :global(.bond) { cursor: crosshair; }
  .box { fill: rgba(37, 99, 235, 0.08); stroke: var(--blue); stroke-width: 1.5; stroke-dasharray: 6 5; pointer-events: none; }
  .box.delete { fill: rgba(220, 38, 38, 0.08); stroke: var(--red); }
  .empty text { fill: #9aa0aa; }

  .carried {
    position: fixed; z-index: 100; display: grid; place-items: center; width: 3rem; height: 3rem;
    transform: translate(-50%, -50%); border: 2px solid var(--blue); border-radius: 12px; background: #fff;
    box-shadow: 0 8px 20px rgba(16, 24, 40, 0.2); font: 700 1.6rem Arial, Helvetica, sans-serif; color: #111;
    pointer-events: none; user-select: none;
  }

  /* Phones: the message goes under the buttons. */
  @media (max-width: 640px) {
    .toolbar { flex-wrap: wrap; }
    .message { flex-basis: 100%; margin: 0.2rem 0.3rem 0.1rem; text-align: left; }
    .keys { display: none; }
  }

  /* Wide screens: the tools on the left and the page filling the window beside them. */
  @media (min-width: 861px) and (min-height: 560px) {
    .editor {
      display: grid;
      grid-template-columns: 17rem minmax(0, 1fr);
      height: calc(100vh - var(--topbar-h));
      padding: 1.25rem;
      gap: 1.25rem;
    }
    .tools { min-height: 0; overflow-y: auto; }
    .figure-side { display: flex; min-height: 0; }
    .canvas { flex: 1; min-height: 0; }
    .sheet { flex: 1; min-height: 0; }
    .page { height: 100%; }
  }
</style>
