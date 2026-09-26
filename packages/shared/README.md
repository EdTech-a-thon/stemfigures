# @stemfigures/shared

Components and helpers used by more than one STEM Figures site, imported as
`$shared/...` (the alias is set in each app's `svelte.config.js`).

| File                                                                                        | Used by                                   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `request.svelte.ts`                                                                         | math, physics, chemistry, biology, engineering |
| `Modal`, `Presets`, `presetStore`, `history`, `LabelField`, `generatorState`                | chemistry, biology, engineering           |
| `FigureCanvas`, `FigureFrame`, `GeneratorPage`, `HelpTip`, `Section`, `exporting`, `settings`, `figureText` | biology, engineering |

Chemistry, Math and Physics keep their own versions of the rest in their
`src/lib/`. When changing a file here, run `npm run check` and `npm run build`
in every app that imports it.
