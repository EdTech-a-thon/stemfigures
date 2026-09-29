<script lang="ts">
  // How teachers may reuse the example figures, for the example images' license
  // details (see $lib/examples/license.ts).
  import { IMAGE_LICENSE } from '$lib/examples/license'
  import Seo from '$lib/site/Seo.svelte'
</script>

<Seo title="Reusing our figures" description="Physics Figures’ example figures are open source under Apache 2.0: use them in tests, worksheets, slides or anything else." path={IMAGE_LICENSE.page} />

<div class="page">
  <a class="back" href="/">← All figures</a>
  <h1>Reusing our figures</h1>
  <p class="sub">Use them for anything, no need to ask.</p>

  <section class="card">
    <p>
      The example figures on this site are free to use in your tests, worksheets, slides, lesson materials or anything
      else. Copy, print, change and share them however you like. Like everything on STEM Figures, they’re open source
      under the <a href={IMAGE_LICENSE.url} rel="license">{IMAGE_LICENSE.fullName}</a>.
    </p>
    <p>{IMAGE_LICENSE.copyright}.</p>
  </section>
</div>

<style>
  .page { max-width: 46rem; margin: 0 auto; padding: 1.5rem 1.25rem 2rem; }
  .back { display: inline-block; margin-bottom: 1rem; color: var(--blue-dark); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
  .back:hover { text-decoration: underline; }
  h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; }
  .sub { margin: 0 0 1.5rem; color: var(--muted); }
  .card { padding: 1.25rem 1.5rem; }
  .card p { margin: 0 0 0.75rem; color: #374151; }
  .card p:last-child { margin-bottom: 0; }
  .card a { color: var(--blue-dark); font-weight: 600; text-decoration: none; }
  .card a:hover { text-decoration: underline; }
</style>
