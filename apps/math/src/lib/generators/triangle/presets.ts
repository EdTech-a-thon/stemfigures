// The Triangle Generator's presets: the ones the teacher saves in this
// browser. There are none built in.

import { createPresetStore } from '$lib/shared/presetStore.js'
import { FIGURE_KEYS, cleanSettings, type Settings } from './settings.js'

const figureOnly = (s: Settings) => Object.fromEntries(FIGURE_KEYS.map((k) => [k, s[k]])) as Settings

export const presetStore = createPresetStore('mathfigures.triangle.presets', (s) => figureOnly(cleanSettings(s)))
