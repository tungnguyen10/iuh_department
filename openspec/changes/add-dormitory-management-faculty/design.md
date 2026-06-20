## Context

The repository now has a shared-platform plus selected-faculty architecture. `health-science` is the first real migrated faculty module, and `_template` is only a minimal scaffold. The new Dormitory Management site should be a real selected module that can run with `FACULTY=dormitory-management`.

The requested Dormitory site should feel similar to Health Science in composition: header/footer, contact, carousel, partners, infrastructure, news, and stats. Some of those pieces are already shared platform components, but several shared HTML sections still contain Health Science-flavored placeholder content. The implementation needs to reuse shared UI without leaking Health Science-specific copy, images, or search data into the Dormitory site.

## Goals / Non-Goals

**Goals:**

- Add `src/faculties/dormitory-management` as a runnable selected module.
- Keep the new module compatible with the existing Vite faculty selection contract.
- Create Dormitory-owned home and contact pages.
- Reuse shared header, footer, search modal, global widgets, common components, and runtime declarations where appropriate.
- Provide Dormitory-specific content for carousel, infrastructure, stats, news, partners, contact, and search data.
- Preserve `FACULTY=health-science` build behavior.

**Non-Goals:**

- No CMS, backend, API, or data model migration.
- No redesign of the IUH visual system.
- No changes to public route strategy or deployment base path.
- No full generalization of every shared section unless needed to prevent Dormitory content from using Health Science-specific text.
- No removal or rewrite of the Health Science faculty module.

## Decisions

### Decision 1: Add Dormitory as a real selected module

Create `src/faculties/dormitory-management` with the same ownership categories used by Health Science:

```text
src/faculties/dormitory-management/
|-- assets/
|   |-- documents/
|   |-- images/
|   `-- svgs/
|-- components/
|-- data/
|-- faculty.config.js
`-- pages/
```

Rationale: the user wants this site to run like Health Science, so a copy-only template would be the wrong abstraction. `FACULTY=dormitory-management` should be the build contract.

Alternative considered: create another `_template-*` scaffold. Rejected because it would not be a runnable production-like module and would leave content ownership ambiguous.

### Decision 2: Keep Dormitory-specific visual/content sections faculty-owned

Carousel and infrastructure should live under `src/faculties/dormitory-management/components/home`. These sections are visually similar to Health Science but their content, imagery, and links are Dormitory-specific.

Rationale: copying Health Science assets or text would produce a technically working but semantically wrong site. Keeping these sections in the Dormitory module makes ownership obvious.

Alternative considered: promote Health Science carousel and infrastructure into shared components immediately. Rejected for this change because the current markup is content-heavy and not yet parameterized enough to be safely shared.

### Decision 3: Reuse shared cards/runtime, but avoid shared section content leakage

Shared runtime modules for header, footer, search, stats cards, news carousel, and partners canvas can remain shared. For content-heavy sections such as stats, news, and partners, the implementation should either:

- create Dormitory-owned wrapper sections that include shared cards, or
- parameterize shared sections enough that Dormitory content is supplied by the selected module.

The first implementation should prefer Dormitory-owned wrappers when that is simpler and lower risk.

Rationale: `src/shared/components/news/index.html`, `stats/index.html`, and `partners/index.html` are reusable in shape, but currently include specific titles, counts, descriptions, partner images, or Health Science-flavored excerpts. Dormitory must not inherit that content by accident.

Alternative considered: include the existing shared sections directly on the Dormitory home page. Rejected because it risks visible wrong-domain content.

### Decision 4: Provide minimal Dormitory runtime config

`src/faculties/dormitory-management/faculty.config.js` should declare only Dormitory-owned module initializers, likely:

- hero carousel
- infrastructure carousel/grid behavior if the implementation uses JS

Shared modules such as header, footer, search, stats, news, and partners should continue to come from `src/shared/shared.config.js`.

Rationale: `src/main.js` should stay selected-faculty agnostic. Adding the second real module is a useful test that `@faculty/faculty.config.js` does not assume Health Science.

### Decision 5: Start with minimal required pages

Add:

- `pages/index.html`
- `pages/contact.html`

Optional Dormitory-specific list/detail pages for news or partners can be deferred unless needed for links not to break. Initial card links can point to the contact page, root page, or placeholder route only if documented and visibly not misleading.

Rationale: the user specifically asked for a runnable Dormitory site with the listed sections. Home and contact are enough to prove the module and avoid creating a large content surface with placeholder routes.

## Risks / Trade-offs

- Wrong-domain content leakage -> Audit Dormitory home/contact output for Health Science copy, Health Science-only assets, and Health Science search data.
- Broken asset references -> Put Dormitory-owned images under `src/faculties/dormitory-management/assets/images` or intentionally use shared defaults until real Dormitory imagery exists.
- Duplicated section markup -> Accept small Dormitory-owned wrappers first; promote to shared later only when a second module proves the abstraction.
- Search data missing or irrelevant -> Add Dormitory-specific `data/search-data.json` and verify search modal fetches selected faculty data.
- Build tool mismatch -> Use the repo's currently working `npm.cmd run build`/direct Vite path for verification if Yarn remains blocked by lockfile/toolchain mismatch.

## Migration Plan

1. Create the Dormitory faculty root and required ownership subdirectories.
2. Add `faculty.config.js` with metadata, source/output paths, style glob, and Dormitory runtime modules.
3. Add Dormitory home and contact pages with `LAYOUT` metadata.
4. Add Dormitory-owned carousel and infrastructure components, including JS/SCSS only when needed.
5. Add Dormitory-specific wrappers or parameterization for stats, news, and partners so visible content is not Health Science-specific.
6. Add Dormitory search data and any required assets.
7. Build and verify `FACULTY=dormitory-management`.
8. Build and verify `FACULTY=health-science` still passes.
9. Update docs with the new faculty id and any content ownership notes.

Rollback is straightforward before deployment: remove `src/faculties/dormitory-management` and any docs/source changes made only for the Dormitory module. Shared changes should be kept only if independently useful and verified with Health Science.

## Open Questions

- What final Vietnamese display text should be used for Dormitory contact address, phone, email, and office hours?
- Are real Dormitory images available now, or should the first implementation use shared default images with clear Dormitory copy?
- Should Dormitory have `news.html` and `partners.html` pages immediately, or can section links route to home/contact until content exists?
