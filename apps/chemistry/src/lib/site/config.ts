// Facts about the site as a whole.

import type { SiteId } from '$shared/catalog/index'

/** its name in the STEM Figures catalog */
export const SITE_ID: SiteId = 'chemistry'

export const SITE_NAME = 'Chemistry Figures'
export const SITE_URL = 'https://chemistryfigures.com'
export const SUPPORT_EMAIL = 'support@teacher.dev'

// The STEM Figures family this site belongs to, and its other sites, linked
// from the top bar.
export const FAMILY = { name: 'STEM Figures', url: 'https://stemfigures.com' }
export const SISTER_SITES = [
  { name: 'Math Figures', url: 'https://mathfigures.com' }
]
