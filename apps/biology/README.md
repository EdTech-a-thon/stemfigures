# Biology Figures

Generators for clean, printable biology figures that teachers paste into tests,
worksheets and slides. Live at **https://biologyfigures.com**, a teacher.dev
project. See `CONTEXT.md` for the vocabulary (figure, generator, directory…)
and `docs/adr/` for decisions.

## Pages

- `/` **Directory**: every generator as a card with a live preview, plus a
  card to request one we don't make yet.
- `/cell-division` **Mitosis & Meiosis**: cells at the phases of mitosis
  (interphase G1 or G2 through cytokinesis) or meiosis (prophase I through the
  four haploid cells), for 2n = 2, 4, 6 or 8, in an animal or plant cell. One
  phase, or a strip of phases in order or shuffled from a seed. Homologous
  pairs differ in size, each with a maternal and a paternal member (dark and
  light in color, solid and outlined in black and white); crossing over swaps
  tetrads' tips and carries into every later cell. Labels: phase names,
  numbers or blank lines, "2n = 4" or chromosome counts under each cell, and
  on one phase the structures (chromosome, sister chromatids, centromere,
  tetrad or homologous pair, spindle fibers, centrioles, nuclear envelope,
  cleavage furrow or cell plate) as names, letters or blank lines.
- `/about`, `/privacy`, `/sitemap.xml`, `/robots.txt`

Every page has the top bar: the site name, the current generator, and a
"Built by teacher.dev" link, which the footer repeats. The directory's search box filters its cards as
you type, and its last card is **Request a generator**. Generators fill the
window with no footer. The help button in the corner opens the same kind of
email dialog. Behind every page are faint biology doodles: a DNA helix,
a cell, a leaf, a mitochondrion, a bacterium and a Punnett square.

A generator's settings live in the page address, so a link opens the same
figure, and the server renders that figure on first load (see ADR 0001).
Saved presets stay in the browser's localStorage.

## Code layout

```
src/routes/            SvelteKit pages
src/lib/site/          top bar, directory dialogs, Help, footer, SEO
src/lib/shared/        pieces every generator uses: figure card and toolbar,
                       undo history, presets, dialogs, fields
$shared/               ../../packages/shared: pieces shared with the other sites
src/lib/generators/    index.ts lists every generator; one folder each
```

To add a generator: make a folder under `src/lib/generators/` with its
builder and preview, add one entry to `generators/index.ts`, and add its route
under `src/routes/`. The directory, search and sitemap pick it up from the list.

## Development

```bash
npm install   # once, from the stemfigures repo root (npm workspaces)
../../../scripts/agent-dev.mjs stemfigures/apps/biology   # from the workspace, never npm run dev directly
npm run check   # svelte-check
npm run build
```

Deployed on Vercel with `@sveltejs/adapter-vercel`. The Cloudflare Web
Analytics token is read from `CF_BEACON_TOKEN`, which is set only in
Vercel's production environment.
