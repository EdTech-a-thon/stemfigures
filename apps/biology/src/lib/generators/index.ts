// Every generator on the site. Their names, addresses and search words are
// in the STEM Figures catalog ($shared/catalog), with every other site's;
// here each gets the component drawing its directory preview. Page titles,
// the sitemap and the top bar read GENERATORS.

import type { Component } from 'svelte'
import { generatorsOn } from '$shared/catalog/index'
import { SITE_ID } from '$lib/site/config'
import MicroscopeFieldOfViewPreview from './microscope-field-of-view/Preview.svelte'

// Each generator's directory preview, by catalog id.
export const PREVIEWS: Record<string, Component> = {
  'microscope-field-of-view': MicroscopeFieldOfViewPreview,
}

export const GENERATORS = generatorsOn(SITE_ID, PREVIEWS)

export type Generator = (typeof GENERATORS)[number]

export const findGenerator = (path: string) => GENERATORS.find((g) => g.path === path)
