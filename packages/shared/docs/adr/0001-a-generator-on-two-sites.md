# A generator copied onto two sites

Until now every generator in the catalog lived on one site, its only address, and other sites could list it with `alsoOn`, linking across to that site. Length Reading breaks that rule: it is a generator on both Math Figures (`mathfigures.com/length-reading`) and Chemistry Figures (`chemistryfigures.com/length-reading`). Measuring with a ruler is as much a math lesson (reading to the nearest quarter inch, measuring from a point other than 0) as a chemistry lab skill (the estimated digit), and a math teacher sent to chemistryfigures.com for it lands on a site whose other generators are not for them.

## Decision

1. **Each site has its own copy of the generator.** Math's `src/lib/generators/length-reading/` is a copy of Chemistry's, and each site draws, exports and saves it on its own, like any of its own generators. Math's copy uses the reading pieces in `packages/shared` (magnifier, marks, figure frame, title settings) where Chemistry uses its own copies of them, and `objectKinds.ts` holds the part of Chemistry's Volume by Displacement objects it needs.
2. **The catalog has an entry on each site with the same id.** Ids are unique within a site rather than across the catalog. Each entry follows its own site's style (Math's names end in "Generator"). The preview snapshot is keyed by id, so both entries share one.
3. **A site's directory shows only its own copy.** Searching Math Figures doesn't show Chemistry's copy again under Chemistry Figures, or the other way round. A site with neither shows both, each under its site.

## Considered Options

- **List it on Math with `alsoOn`**: no new code, but Math's card links away to chemistryfigures.com, which is the problem.
- **Move the generator into `packages/shared` and import it on both sites**: one copy to keep up, but a change for one site's teachers changes the other's, against the rule that each site is independent, and it would pull Chemistry's own reading pieces into the package with it.

## Consequences

A fix or feature in Length Reading has to be made in both apps, or deliberately left on one; the copies may drift, and that is allowed. When changing one, diff the two folders (`apps/math/src/lib/generators/length-reading` and `apps/chemistry/src/lib/generators/length-reading`): they should differ only in imports and the page's name. Another generator put on two sites should follow the same pattern.
