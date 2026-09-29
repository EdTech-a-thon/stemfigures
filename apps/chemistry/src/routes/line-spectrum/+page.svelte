<script lang="ts">
  import LineSpectrum from '$lib/generators/line-spectrum/LineSpectrum.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/line-spectrum')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<LineSpectrum />
