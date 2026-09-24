import { SITE_URL } from '$lib/site/config'

export const prerender = true

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc></url>\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
