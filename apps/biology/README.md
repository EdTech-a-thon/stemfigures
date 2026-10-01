# Biology Figures

Generators for clean, printable biology figures that teachers paste into tests,
worksheets and slides. Live at **https://biologyfigures.com**, a teacher.dev
project. See `CONTEXT.md` for the vocabulary (figure, generator, directory…)
and `docs/adr/` for decisions.

## Pages

- `/` **Directory**: every generator as a card with a live preview, plus a
  card to request one we don't make yet.
- `/cell-diagram` **Cell Diagram** (turned off for now, a 404): an animal, plant or bacterial cell, one
  per figure, in color or black-and-white line art. A checklist (or a click
  on the figure) picks which structures it shows and which are labeled;
  labels are names, numbers or letters (with a word bank and answer key),
  or blank lines, down both sides with leader lines that never cross.
- `/population-growth` **Population Growth**: exponential (J-curve),
  logistic (S-curve), both together, overshoot and oscillation around K, or a
  boom and crash, from N₀, r and K. Graphs population size, the growth rate
  dN/dt or the per capita growth rate, over time or against N, one graph or
  two stacked on the same x-axis. Marks the carrying capacity, the inflection
  point and the lag, exponential and stationary phases; adds census points
  (with a little scatter) and a census table; any label can be a blank line,
  and the curve can be left off for blank axes. Classroom setups start it
  from yeast in a flask, deer on an island, doubling bacteria and more.
- `/punnett-square` **Punnett Square**: a monohybrid, dihybrid or X-linked
  cross typed as the parents' genotypes (Tt × tt), with complete, incomplete
  or codominance (Cᴿ Cᵂ, Iᴬ Iᴮ i). Gametes, parents and any cells can be left
  blank; cells can be shaded by phenotype in gray, hatching or dots; genotype
  and phenotype ratios print underneath as ratios, percentages or fractions.
- `/pedigree` **Pedigree**: a random family for autosomal dominant or
  recessive, X-linked dominant or recessive, or Y-linked inheritance, over 2
  to 4 generations, that students can diagnose; or a classic (hemophilia in
  a royal family, Huntington's, cystic fibrosis, albinism, color blindness,
  vitamin D–resistant rickets). Click anyone to change their sex or status,
  mark them deceased or the proband, make twins, or add a child, partner or
  sibling; the family is written into the address. It checks the family
  against every mode and says how students can tell, and can show carriers
  (half filled or a dot), genotypes as answers or blanks, numbers and a key.
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
- `/predator-prey` **Predator–Prey Cycles**: a predator and its prey (hare
  and lynx, wolf and moose, or your own pair) rising and falling out of step,
  from the Lotka–Volterra model, worked out from where they start, their
  averages and the cycle length, or from the model's four rates. Both
  populations over time, on one y-axis or with the predators on the right,
  or as a phase plane loop; smooth curves or census counts with seeded
  noise; the peaks, lag and period marked, labeled or left blank, and either
  population left off for students to sketch. Built on `$shared/graph`.
- `/gel-electrophoresis` **Gel Electrophoresis**: an agarose gel of 2 to 12
  lanes, each a DNA ladder (100 bp, 1 kb or λ/HindIII) or a sample with the
  band sizes typed in. Bands run linearly in log size over the gel's range
  (0.8 to 2% agarose) and crowd together past it; bands too close to
  separate run as one. Printable, blue-stained or glowing, with ladder
  sizes, lane names, electrodes and a ruler shown or blanked, and sample
  lanes left blank for students to draw.
- `/micropipette-reading` **Micropipette Reading**: a 2, 10, 20, 100,
  200 or 1000 µL micropipette (Gilson's P2 to P1000), labeled with its size
  and set to the volume typed, which is checked against its range and steps.
  Its display shows three digit wheels read top to bottom, red where the
  decimal point goes (Gilson's convention), with a line there too for black
  and white copies, and a magnifier on the display.
- `/microscope-field-of-view` **Microscope Field of View**: the circle seen
  down a compound microscope, drawn to scale: onion or Elodea cells, cheek or
  red blood cells, paramecia, simple cells or circles, or the letter e, at
  any eyepiece and objective, and the same slide at a higher power beside
  it. The field's diameter is typed or worked out from the low-power one.
  Optional clear mm ruler, scale bar and diameter arrow; a question written
  for the settings and an answer box, shown or blank.
- `/about`, `/privacy`, `/sitemap.xml`, `/robots.txt`

Every page has the top bar: the site name and the current generator on the
left, and links to the other STEM Figures sites on the right, which the footer
repeats along with the "Built by teacher.dev" link. The directory's search box
filters its cards as you type, and its last card is **Request a generator**. Generators fill the
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
