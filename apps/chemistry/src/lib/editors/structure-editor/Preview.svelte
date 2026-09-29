<script lang="ts">
  // The Organic Structure Editor's directory card: ethanol, drawn the way
  // the editor draws it, every atom on the grid.
  import StructureDrawing from './StructureDrawing.svelte'
  import { cropBox, GRID, type Atom, type Bond, type ElementSymbol, type Structure } from './structure'

  const at = (id: string, element: ElementSymbol, col: number, row: number): Atom => ({ id, element, x: col * 2 * GRID, y: row * 2 * GRID })
  const atoms = [
    at('c1', 'C', 2, 2), at('c2', 'C', 3, 2), at('o', 'O', 4, 2), at('ho', 'H', 5, 2),
    at('h1', 'H', 1, 2), at('h2', 'H', 2, 1), at('h3', 'H', 2, 3), at('h4', 'H', 3, 1), at('h5', 'H', 3, 3),
  ]
  const bond = (a: string, b: string): Bond => ({ id: `${a}-${b}`, a, b, order: 1 })
  const ethanol: Structure = {
    atoms,
    bonds: [bond('c1', 'c2'), bond('c2', 'o'), bond('o', 'ho'), bond('h1', 'c1'), bond('h2', 'c1'), bond('h3', 'c1'), bond('h4', 'c2'), bond('h5', 'c2')],
  }
  const crop = cropBox(ethanol)!
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="{crop.x} {crop.y} {crop.width} {crop.height}" font-family="Arial, Helvetica, sans-serif">
  <StructureDrawing structure={ethanol} />
</svg>
