## Context

The Vite build plugin in `vite.config.js` includes two long renderer factories — `createNewsRenderer(base, facultyDataRoot)` (~200 lines) and `createActivitiesRenderer(base, facultyDataRoot)` (~150 lines). Each defines several template-literal HTML producers (`card`, `eventCard`, `listCard`, `sidebarCard`, `articleBlock`, `section`, `detail`, `categoryItems`) that get spliced into pages at `transformIndexHtml` time, replacing marker divs like `data-news-carousel-items`, `data-activities-sidebar-items`, etc.

`tailwind.config.js` scans:

```js
content: [
  "./src/shared/**/*.{html,js}",
  "./src/faculties/**/*.{html,js}",
]
```

Because `vite.config.js` is outside those globs, every arbitrary-value Tailwind class that only appears inside those inline templates (e.g. `h-[72px]`, `w-[70px]`, `gap-[21px]`, `md:h-[85px]`, `lg:gap-[21px]`) is silently dropped from the compiled CSS. Plain-token classes (`flex`, `gap-2`, `md:gap-2.5`) survive because the same tokens are also referenced from real `.html` components Tailwind does scan.

Symptom that triggered this change: the activities sidebar `<figure>` on `activities-details.html` rendered at the image's intrinsic size (5500×3700) on mobile, blowing out the layout. Root cause is the missing `h-[72px] w-[72px] shrink-0 md:h-[85px] md:w-[85px]` rules.

A previous quick fix added `./vite.config.js` to Tailwind's `content`. That works but encourages a long-term anti-pattern: presentational markup hidden inside build config, invisible to component owners and prone to drift from sibling components.

## Goals / Non-Goals

**Goals:**
- All Tailwind classes used by news and activities renderer output are emitted reliably without listing build config in Tailwind's `content`.
- Renderer templates live next to (or inside) their feature folder so developers editing a sidebar card can find the markup by navigating components, not config.
- `vite.config.js` shrinks back to plugin/wiring concerns: data loading, attribute stripping, HTML traversal — not HTML production.
- Output HTML is byte-equivalent to today's output (apart from the previously missing visual classes that will now take effect).

**Non-Goals:**
- No change to the `data-news-*` / `data-activities-*` HTML contract or the JSON data shape.
- No redesign of card visuals; this is a refactor, not a restyle.
- No move to a client-side rendering model; rendering stays at build time inside the Vite plugin.
- No new abstraction for "all data-driven sections" — only the two existing renderers move. Future renderers can follow the same pattern.

## Decisions

### D1 — Where renderer modules live

Put each renderer module in a `*-renderer.js` file colocated with the feature's shared component folder:

- `src/shared/components/news/news-renderer.js` exports `createNewsRenderer({ base, facultyDataRoot, readDataFile, log })`.
- `src/shared/components/activities/activities-renderer.js` exports `createActivitiesRenderer({ base, facultyDataRoot, readDataFile, log })`.

Activities currently does not have a shared component folder — the shells live under `src/faculties/dormitory-management/components/activities/`. Two options were considered:

1. Put the renderer next to the faculty component (`src/faculties/dormitory-management/components/activities/activities-renderer.js`).
2. Put it under a new `src/shared/components/activities/` folder.

Choose **option 2**. The activities marker contract (`data-activities-*`) and the JSON schema are already faculty-agnostic in the plugin, the renderer reads from the *selected* faculty data root, and Health Science is expected to grow its own activities content. Treating activities as shared mirrors the news pattern and avoids re-extracting later.

The colocated `.html` shells in `src/faculties/<faculty>/components/activities/` stay where they are (they're consumed via `data-include`). Only the JS renderer is shared.

### D2 — Module shape and dependency injection

Each renderer module is pure: it exports a factory that takes everything it needs as arguments. It must not call Node APIs (`fs`, `path`) at module top-level — that keeps the file scannable by Tailwind and importable from anywhere if we ever need to render in a non-Node context.

```js
// src/shared/components/news/news-renderer.js
import { escapeHtml } from '../../js/escape-html.js'

export const createNewsRenderer = ({ base, items, sectionMeta }) => {
  const withBase = (path) => { /* … */ }
  const card = (item) => `<article class="…">…</article>`
  // …
  return (html) => { /* mutate html */ }
}
```

`vite.config.js` keeps the JSON loaders (`loadFacultyNewsData`, `loadFacultyActivitiesData`) — they need `fs` — calls them, and passes the parsed result into the renderer factory.

### D3 — Shared helpers

Two utilities show up in both renderers and in `vite.config.js`:

- `escapeHtml(value)` — already trivial, move to `src/shared/js/escape-html.js`.
- `withBase(path, base)` — small enough that each renderer can keep its own closure copy; not worth a shared module.

Attribute strippers (`stripNewsAttrs`, `stripActivitiesAttrs`) and the `replaceInner` helper are tightly coupled to the renderer's marker set, so they move with the renderer.

### D4 — Tailwind config stays clean

After this change, `tailwind.config.js` keeps its current `content` globs. Do **not** add `./vite.config.js`. Add a short comment explaining the constraint: any new build-time HTML template must live under `src/**` so Tailwind sees its classes.

### D5 — Verification strategy

1. Diff generated HTML before/after for `news-detail.html`, `news.html`, `activities-details.html`, `activities.html` on both faculties. The only diffs allowed are whitespace inside template strings.
2. Build with Dormitory Management as the selected faculty, then grep the produced CSS for the previously-missing arbitrary classes (`h-[72px]`, `w-[70px]`, `md:h-[85px]`, `h-[130px]`, `gap-[21px]`, `md:w-[30px]`, `md:h-[30px]`). All must appear.
3. Visual smoke test of `activities-details.html` at 375px and 1280px widths to confirm the sidebar card returns to a 72/85 px thumbnail.

## Risks / Trade-offs

- **Risk:** Subtle drift in template strings during extraction (escaping, whitespace) silently changes generated HTML → **Mitigation:** copy verbatim, then diff generated HTML output for at least one page per marker type before merging.
- **Risk:** Future contributors re-introduce inline templates in `vite.config.js` and the bug returns → **Mitigation:** add a one-line comment in `vite.config.js` near the plugin entry pointing at the renderer modules and explaining the Tailwind-scan constraint.
- **Risk:** Activities renderer placed under `src/shared/components/activities/` while there are no `.html` siblings yet → **Mitigation:** acceptable; create the folder with just the renderer and a brief `README.md` (one paragraph) so it doesn't look orphaned. No new shared component HTML is required by this change.
- **Trade-off:** Two more files to navigate, but each is shorter and closer to its feature. Net cognitive load goes down for component authors and up only marginally for someone editing the build pipeline.

## Migration Plan

1. Land the extraction in a single commit; the change is internal and has no runtime feature flag.
2. No data migration. No rollback steps beyond reverting the commit.
3. After merge, confirm a Dormitory Management build still produces a working `activities-details.html` mobile layout.

## Open Questions

- Should `escapeHtml` move now, or wait for a future utility-consolidation pass? Recommended: move now, since both renderers will import it and `vite.config.js` already has its own copy.
