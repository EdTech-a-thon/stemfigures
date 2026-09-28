<script lang="ts">
  import GasSyringe from '$lib/generators/gas-syringe/GasSyringe.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/gas-syringe')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<GasSyringe />
