<script lang="ts">
  // The Length Reading Generator's page: its search engine details and the
  // generator, the same one Chemistry Figures has.
  import { findGenerator } from '$lib/generators/index.js'
  import LengthReading from '$lib/generators/length-reading/LengthReading.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/length-reading')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<LengthReading />
