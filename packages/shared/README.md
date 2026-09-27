# @stemfigures/shared

Components and helpers used by more than one STEM Figures site, imported as
`$shared/...` (the alias is set in each app's `svelte.config.js`).

| File                                                                                        | Used by                                   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `request.svelte.ts`                                                                         | math, physics, chemistry, biology, engineering |
| `Modal`, `LabelField`                                                                       | chemistry, biology, engineering           |
| `GeneratorPage`, `generatorState`, and through them `FigureCanvas`, `Presets`, `presetStore`, `history`, `exporting` | chemistry |
| `FigureFrame`, `HelpTip`, `Section`, `settings`, `figureText`                               | none yet                                  |

`GeneratorPage` is the page every generator is meant to use: presets and
settings down the left, the figure card on the right. Its `settingsWidth` is
the settings column's width in rem on wide screens (24 unless a generator
passes its own), so each generator can decide how the page is split.

Math and Physics still keep their own page layouts and the rest in their
`src/lib/`. When changing a file here, run `npm run check` and `npm run build`
in every app that imports it.
