## Context

The repository already separates shared platform UI from selected-faculty content. News is only partially aligned with that model: cards and carousels live in `src/shared/components/news`, but some shared components still contain Health Science-specific titles, dates, links, excerpts, and images. Dormitory Management currently owns a home news wrapper with Dormitory content and temporary links to `contact.html` because no shared data-driven news route exists yet.

The build system already injects shared components such as header and footer during HTML transformation. News should follow that same static rendering model: selected-faculty `news.json` is a source file read during build/dev HTML transform, not a browser runtime dependency.

## Goals / Non-Goals

**Goals:**
- Make news presentation reusable across faculties.
- Keep news content under `src/faculties/<faculty>/data`.
- Let Health Science and Dormitory Management render the same shared news section, detail, related carousel, and sidebar surfaces with different content.
- Remove faculty-specific news copy from shared news/sidebar components.
- Preserve selected-faculty isolation in builds.

**Non-Goals:**
- Add a CMS, database, or network-backed news API.
- Implement full dynamic routing with one generated HTML file per news article.
- Redesign the visual language of news cards, sidebars, or article pages.
- Replace unrelated faculty-owned homepage sections such as carousel, stats, infrastructure, or partners.

## Decisions

1. Use selected-faculty `news.json` as the build-time content contract.

   Faculty-specific news data will live at `src/faculties/<faculty>/data/news.json`. The Vite HTML transform will read it from the selected faculty source and inject static HTML into shared news shells.

   Alternative considered: keep all content in HTML data attributes. That would preserve the existing include model but still duplicate content and make detail/list/sidebar synchronization brittle.

2. Render shared news surfaces during HTML transform.

   Shared HTML components expose stable `data-news-*` placeholders. `transformDataInclude` resolves normal includes first, then replaces those placeholders with card/list/detail/sidebar markup generated from selected-faculty `news.json`.

   Alternative considered: rendering from `/data/news.json` at runtime. That is simpler initially, but it leaves content out of generated HTML and requires a production JSON fetch for news.

3. Keep page ownership with faculties.

   Each faculty still owns the route files under `src/faculties/<faculty>/pages`. Those pages include shared news shells. This preserves the architecture rule that pages are faculty-owned while avoiding duplicated news UI.

4. Use a single faculty news detail route.

   The initial shared detail route will use `news-detail.html` and render the first/featured item from the selected faculty news data. This avoids unnecessary query strings and avoids introducing route generation.

## Risks / Trade-offs

- Build-time news rendering adds more logic to `vite.config.js` -> keep the renderer scoped to `data-news-*` shells and selected-faculty `news.json`.
- Generated HTML now contains news content, but every card links to the single `news-detail.html` route -> can be upgraded later if the build system gains per-article page generation.
- Shared sidebar/news carousel content changes affect many Health Science pages -> keep selectors backward compatible and verify Health Science build.
