# @stemfigures/shared

Components and helpers used by more than one STEM Figures site, imported as
`$shared/...` (the alias is set in each app's `svelte.config.js`).

| File                                                                                        | Used by                                   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `catalog/`, `GeneratorDirectory`                                                            | math, physics, chemistry, biology, engineering |
| `request.svelte.ts`                                                                         | math, physics, chemistry, biology, engineering |
| `Modal`                                                                                     | math, chemistry, physics, biology, engineering |
| `LabelField`                                                                                | chemistry, biology, engineering           |
| `GeneratorPage`, `generatorState`, and through them `FigureCanvas`, `Presets`, `presetStore`, `history`, `exporting` | math, chemistry, physics |
| `labelSize`                                                                                 | math                                      |
| `FigureFrame`, `HelpTip`, `Section`, `settings`, `figureText`                               | none yet                                  |

`catalog/` lists every generator on every site. Each lives on one site
(`site`), the only address it has; `alsoOn` names other sites whose
directories list it after their own generators. `GeneratorDirectory` is each
site's directory: its own generators with live previews, then those it lists
from other sites, and, while searching, matches from every other site under
their site's name. A site can only draw its own previews, so the others show
pictures from `catalog/previews/`. Retake a site's pictures after changing its
previews: start it with `./scripts/agent-dev.mjs`, then run
`node scripts/snapshot-previews.mjs <its address>` from the monorepo root.

To add a generator: its entry in its site's `catalog/` file, its preview in
that app's `src/lib/generators/index.ts`, and a snapshot.

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
