<script lang="ts">
  import BohrModel from '$lib/generators/bohr-model/BohrModel.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/bohr-model')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<BohrModel />
