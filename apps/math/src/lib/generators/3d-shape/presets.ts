// A 3D shape generator's presets: the ones the teacher saves in this
// browser, kept apart for each kind of shape. There are none built in.

import { createPresetStore } from '$lib/shared/presetStore.js'
import { FIGURE_KEYS, settingsFor, type Kind, type Settings } from './settings.js'

export function presetStoreFor(kind: Kind) {
  const { cleanSettings } = settingsFor(kind)
  const figureOnly = (s: Settings) => Object.fromEntries(FIGURE_KEYS.map((k) => [k, s[k]])) as Settings
  return createPresetStore(`mathfigures.${kind}.presets`, (s) => figureOnly(cleanSettings(s)))
}
