<script lang="ts">
  // Under a generator, past the full-window figure: what its figures show and
  // how teachers use them, what can be set, its example figures, and questions teachers ask, from
  // generatorCopy.ts (the same questions go into the page's FAQPage data).
  // It never prints; printing is just the figure.
  import type { CatalogEntry } from '$shared/catalog/index'
  import ExampleGallery from '$lib/examples/ExampleGallery.svelte'
  import type { GeneratorCopy } from './generatorCopy'

  let { generator, copy }: { generator: CatalogEntry; copy: GeneratorCopy } = $props()
</script>

<section class="about no-print" aria-labelledby="about-{generator.id}">
  <div class="card">
    <h2 id="about-{generator.id}">{copy.heading}</h2>
    {#each copy.intro as paragraph, i (i)}<p>{paragraph}</p>{/each}

    <h3>What you can set</h3>
    <ul>
      {#each copy.settings as line, i (i)}<li>{line}</li>{/each}
    </ul>

    <h3>Copying, printing and sharing</h3>
    <p>
      Copy the figure straight into a test, worksheet or slide, or download it as a PNG or SVG. Printing the page prints
      just the figure. Share link copies the page’s address with your settings in it, so anyone who opens it sees this
      exact figure, and presets save settings you use often in your browser. It’s free, with no sign-up.
    </p>
  </div>

  <div class="gallery"><ExampleGallery generator={generator.id} /></div>

  <div class="card">
    <h2>Questions teachers ask</h2>
    <div class="faqs">
      {#each copy.faqs as faq, i (i)}
        <details>
          <summary>{faq.q}</summary>
          <p>{faq.a}</p>
        </details>
      {/each}
    </div>
  </div>

  <a class="back" href="/">← All chemistry figures</a>
</section>

<style>
  .about { max-width: 46rem; margin: 0 auto; padding: 1.5rem 1.25rem 2.5rem; }
  .card { padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
  h2 { font-size: 1.15rem; font-weight: 800; margin-bottom: 0.5rem; }
  h3 { font-size: 1rem; font-weight: 700; margin: 1.1rem 0 0.4rem; }
  p { margin: 0 0 0.75rem; color: #374151; }
  p:last-child { margin-bottom: 0; }
  ul { margin: 0; padding-left: 1.25rem; color: #374151; }
  li + li { margin-top: 0.3rem; }

  /* The gallery lines up with the cards in this column. */
  .gallery :global(.examples) { padding: 0 0 1.25rem; }
  .gallery :global(.examples h2) { font-size: 1.15rem; margin-bottom: 0.75rem; }

  .faqs { margin-top: 0.25rem; }
  details { border-top: 1px solid var(--border); }
  details:last-child { border-bottom: 1px solid var(--border); }
  summary {
    padding: 0.7rem 0;
    font-weight: 600;
    cursor: pointer;
  }
  summary:hover { color: var(--blue-dark); }
  details p { margin: 0 0 0.85rem; }

  .back { display: inline-block; color: var(--blue-dark); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
  .back:hover { text-decoration: underline; }
</style>
