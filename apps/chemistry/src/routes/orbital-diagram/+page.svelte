<script lang="ts">
  import OrbitalDiagram from '$lib/generators/orbital-diagram/OrbitalDiagram.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/orbital-diagram')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<OrbitalDiagram />
