# Notice hub redesign

**Goal:** Make the organization administration homepage's notices, six form categories, and recruitment guidance easier to scan and use.

**Architecture:** Retain the faculty-owned HTML include, `data-module="notice-hub"`, and `{{class}}` animation contract. Use existing Tailwind tokens, local Inter/Roboto fonts, SVG assets, and shared button variant 12. No new runtime module, dependency, or global style.

## Findings and design

- The working tree already contains the user's third recruitment column. Preserve all three recruitment titles and descriptions.
- Equal thirds compress notice text and cause seven form tabs to wrap. Form panels merely repeat the category rows and every link targets the same library. The policy tab has no matching panel.
- Nested 400px scroll areas hide content; single-line recruitment truncation prevents scanning.
- Compare equal cards (least change, poor content fit), a single global tab switcher (compact, hides two sections), and weighted columns (visible content with appropriate widths). Choose weighted columns.
- Use a common section heading, a wider notice column with calendar dates and one important notice highlight, a direct six-category form index, and an IUH-blue recruitment panel.
- Palette: IUH blue #153898, white #FFFFFF, light blue #E3F6FD, yellow #F9B200, title #212121, body #616161. Inter headings; inherited Roboto body. No new font loads or arbitrary brand colors.
- Mobile: one column. From 768px: notices/forms side by side with recruitment below. From 1120px: three weighted columns. No inner scrolling or truncated titles.
- Keep the existing notice dates/content/links and category destinations. Do not invent recruitment vacancies, deadlines, or a recruitment route; link guidance to the existing contact page.
- Use semantic lists, `time` elements, named sections, full-row category links, visible focus, and reduced-motion overrides for this block.

## Implementation and validation

- [x] Inspect includes, shared buttons/tabs, fonts, tokens, adjacent sections, routes, and existing tests.
- [x] Update the existing navigation regression test to check six directly accessible categories and preservation of recruitment content; verify failure before implementation.
- [x] Replace the notice-hub markup, retaining the include interface and shared component conventions.
- [x] Run `npm test` and `FACULTY=organization-administration npm run build`.
- [x] Review browser rendering, destination links, narrow-screen layout, and final diff. Document any limits to visual verification.

Work directly in the user's current checkout to preserve their uncommitted recruitment addition. Do not commit or change unrelated modules.

## Verification results

- Production build for `organization-administration` passes. Final HTML resolves nested shared buttons and retains all five notice links plus seven document-library links (six categories and the footer action). All referenced icons exist.
- The updated navigation regression passes, including all six categories and all three recruitment titles.
- Full suite: 56 passed, 5 failed. All five failures reproduce against archived HEAD: document count expectation, document primitive expectations, shared-button attribute expectation, retained-page vocabulary, and contact address punctuation. No unrelated test or source was changed to hide these failures. The temporary baseline additionally hits a Corepack cache permission error in its build integration test; the actual working tree's build integration passes.
- Chrome desktop visual inspection caught global `header` sticky positioning and `footer` minimum height. Internal wrappers now use `div`; named sections and heading hierarchy retain semantic structure. Rechecked the compact desktop layout after fixing this collision.
- Chrome responsive mode at 375px confirms the one-column layout and wrapping of long notice titles. Further native captures intermittently report capture failures, so no claim of exhaustive cross-device visual coverage.
- No runtime JS, global SCSS, configuration, dependencies, or the user's homepage include were modified.

## CTA follow-up

All three section CTAs use the existing compact outline button primitive (variant 12), including its full-width pill shape, colors, hover, focus and arrow. Removed recruitment-specific color/filter overrides; retained minimum 44px target height and reduced-motion support. Labels and destinations are unchanged.
