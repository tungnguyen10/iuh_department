## Context

The repository uses a shared platform plus selected-faculty architecture. Dormitory Management already exists as a selected faculty module with Dormitory-owned pages, assets, content data, and home components. Its current visible page set includes home, news, news detail, and contact, but the header and search experience do not expose a dedicated About route.

The requested About experience should match the Dormitory domain: student housing operations, safety, maintenance, residence-life support, and community connection. It should not reuse the Health Science About article structure wholesale because that page is a long academic faculty introduction with sidebar content.

## Goals / Non-Goals

**Goals:**

- Add a Dormitory-owned About page at `/about.html`.
- Add an AboutIntroSection under `src/faculties/dormitory-management/components/about`.
- Use Dormitory-owned copy and existing Dormitory assets for first-screen introduction and page body content.
- Make the page discoverable from Dormitory navigation, quick links, search data, and relevant internal links.
- Keep implementation within the existing static include/layout system.
- Preserve Health Science behavior and existing Dormitory home/news/contact behavior.

**Non-Goals:**

- No new backend, API, CMS, or runtime data model.
- No redesign of the shared header, footer, search modal, or global visual system.
- No real-time room availability, registration workflow, or authenticated student portal.
- No requirement to add new image assets if the existing Dormitory assets can support the page.

## Decisions

### Decision 1: Keep the About page faculty-owned

Create `src/faculties/dormitory-management/pages/about.html` and keep all new page-specific sections under the Dormitory faculty root.

Rationale: the content is specific to Phong Quan ly Ky Tuc Xa and belongs with the selected faculty module. This also follows the existing architecture requirement that faculty pages live under `src/faculties/<faculty>/pages`.

Alternative considered: a shared About template. Rejected because the Health Science and Dormitory About narratives differ enough that a shared template would need premature parameterization.

### Decision 2: Use a service-oriented intro instead of a long article hero

The AboutIntroSection should present the unit as a student support and housing operations service:

- clear title and short copy
- two CTAs: contact and infrastructure
- compact metrics reused from existing Dormitory stats themes
- four service pillars: housing, safety, maintenance, community
- Dormitory visual asset panel using existing images/SVGs

Rationale: Dormitory users need fast routing to services and confidence in support channels. A long academic article intro would be harder to scan and less aligned with the current Dormitory home style.

Alternative considered: clone the Health Science `about.html` article card and sidebar. Rejected because it would be too text-heavy and would visually imply an academic department profile rather than a housing service.

### Decision 3: Compose the full page from lightweight static sections

The page should use static HTML sections with Tailwind utility classes and existing shared components where they fit, such as breadcrumb, section title, buttons, news carousel, partners, or infrastructure includes.

Rationale: the current site is generated from static HTML includes. Keeping the About page static avoids unnecessary JavaScript and preserves build simplicity.

Alternative considered: add a new JavaScript-driven About module. Rejected because no interactive behavior is required for the initial page.

### Decision 4: Update discoverability without changing routes

Update Dormitory `faculty.config.js` nav/quick links and `data/search-data.json` to include `/about.html`. Existing home and contact routes remain unchanged.

Rationale: the page is only useful if users can find it from normal navigation and search. The route strategy remains compatible with the static selected-faculty build.

## Risks / Trade-offs

- Wrong-domain copy leakage -> Use Dormitory-specific Vietnamese copy and search for Health Science-only text after implementation.
- Broken links -> Link service CTAs to existing `/contact.html`, `/#infrastructure-section`, `/news.html`, and `/about.html` routes only.
- Visual inconsistency -> Reuse Dormitory colors, spacing, assets, and existing component conventions from home/contact.
- Overbuilding the page -> Keep the first implementation static and focused on introduction, services, operating approach, and contact CTA.

## Migration Plan

1. Add the AboutIntroSection component under Dormitory components.
2. Add `pages/about.html` with layout metadata, breadcrumb, intro, service/operation sections, optional infrastructure include, and CTA.
3. Update Dormitory faculty config navigation and quick links to expose About.
4. Update Dormitory search data to return the About page for relevant queries.
5. Verify the Dormitory selected build and OpenSpec change validation.

Rollback: remove the new About page/component and revert the Dormitory nav/search link additions. No shared contract or dependency migration is required.

## Open Questions

- Real Dormitory photography can replace the existing SVG/banner assets later if available.
