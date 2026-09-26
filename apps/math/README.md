# Math Figures

Generators for clean, printable math figures that teachers paste into tests,
worksheets and slides. Live at **https://mathfigures.com**, a teacher.dev
project. See `CONTEXT.md` for the vocabulary (figure, generator, directory…)
and `docs/adr/` for decisions.

## Pages

- `/` **Directory**: every generator as a card with a live preview, plus a
  card to request one we don't make yet.
- `/coordinate-grid` **Coordinate Grid Generator**: equations to graph (straight
  lines and points, one per row), range and numbering,
  chart and axis titles (text or a blank line for students), axis labels, and
  a Figma-style end cap for each end of each axis. Presets, undo/redo, copy
  image, PNG/SVG download and copy link.
- `/triangle` **Triangle Generator**: a triangle drawn to scale from any three
  of its sides and angles (typed with fractions or √), solved for the rest.
  Each side and angle is labeled with its measure, typed math like x, or
  nothing, with congruence marks; heights, right-angle squares, a unit,
  rounding, base side, flip and turn. Labels can be dragged on the figure.
- `/about`, `/privacy`, `/sitemap.xml`, `/robots.txt`

Every page has the top bar: the site name, the current generator, and a
"Built by teacher.dev" link, which the footer repeats. The directory's search box filters its cards as
you type, and its last card is **Request a generator**. Generators fill the
window with no footer. The help button in the corner opens the same kind of
email dialog.

A generator's settings live in the page address, so a link opens the same
figure, and the server renders that figure on first load (see ADR 0001).
Saved presets stay in the browser's localStorage.

## Code layout

```
src/routes/            SvelteKit pages
src/lib/site/          top bar, directory dialogs, Help, footer, SEO
src/lib/shared/        pieces every generator uses: figure card and toolbar,
                       undo history, presets, dialogs, fields, end-cap picker
src/lib/generators/    index.ts lists every generator; one folder each
```

To add a generator: make a folder under `src/lib/generators/` with its
builder and preview, add one entry to `generators/index.ts`, and add its route
under `src/routes/`. The directory, search and sitemap pick it up from the list.

## Development

```bash
npm install
npm run dev
npm run check   # svelte-check: strict TypeScript across .ts and .svelte files
npm test        # unit tests and figure snapshots
npm run build
```

Deployed on Vercel with `@sveltejs/adapter-vercel`. The Cloudflare Web
Analytics token is read from `CF_BEACON_TOKEN`, which is set only in
Vercel's production environment.
