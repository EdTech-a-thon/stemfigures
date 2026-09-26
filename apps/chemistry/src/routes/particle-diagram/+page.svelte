<script lang="ts">
  import ParticleDiagram from '$lib/generators/particle-diagram/ParticleDiagram.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/particle-diagram')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<ParticleDiagram />
