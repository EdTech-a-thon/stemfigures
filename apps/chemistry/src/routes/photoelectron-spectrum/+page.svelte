<script lang="ts">
  import PhotoelectronSpectrum from '$lib/generators/photoelectron-spectrum/PhotoelectronSpectrum.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/photoelectron-spectrum')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<PhotoelectronSpectrum />
