# @stemfigures/shared

Components and helpers used by more than one STEM Figures site, imported as
`$shared/...` (the alias is set in each app's `svelte.config.js`).

| File                                                                                        | Used by                                   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `request.svelte.ts`                                                                         | math, physics, chemistry, biology, engineering |
| `Modal`                                                                                     | math, chemistry, physics, biology, engineering |
| `LabelField`                                                                                | chemistry, biology, engineering           |
| `GeneratorPage`, `generatorState`, and through them `FigureCanvas`, `Presets`, `presetStore`, `history`, `exporting` | math, chemistry, physics |
| `labelSize`                                                                                 | math                                      |
| `FigureFrame`, `HelpTip`, `Section`, `settings`, `figureText`                               | none yet                                  |

`GeneratorPage` is the page every generator is meant to use: presets and
settings down the left, the figure card on the right. Its `settingsWidth` is
the settings column's width in rem on wide screens (24 unless a generator
passes its own), so each generator can decide how the page is split. Its
other options:

- `inputs`: a card of its own between the presets and the settings groups,
  for what the teacher types first (Math's equations and measures).
- `labelSize`: bound to a generator's label size setting, it adds the label
  size picker to the figure card's toolbar.
- `printWidth` and `printHeight`: the printed figure's size in inches. It
  prints 7.5in wide unless a generator says otherwise; with a height too, the
  figure is fitted into that box.
- `svg`: the figure to export. Without it, the first `<svg>` in the figure
  card is exported.

`generatorState` takes the browser storage names for undo history and
presets as a third argument, for a site whose teachers already have them
saved under other names (Math and Physics do).

Every site keeps the rest in its own `src/lib/`. When changing a file here, run `npm run check` and `npm run build`
in every app that imports it.
