# Homepage work updates

**Goal:** Add a document preview and work-calendar block in the organization administration homepage, following the user's screenshot references and the existing UI primitives.

**Architecture:** One faculty-owned `work-updates` include after `notice-hub` and before shared news. Extend the existing faculty document-row primitive with a compact homepage variant. The calendar displays a complete empty state until the user provides the real calendar source; do not publish screenshot appointments as real events.

## Homepage review and placement

Current sequence: carousel → staff services → notice hub → news → statistics → activity gallery → partners. Staff services was changed by the user in the working tree and replaces responsibility areas; preserve this change.

Place work updates after the notice hub: action shortcuts first, notices next, then supporting documents/calendar, then editorial/institutional content. Avoid placing operational updates below statistics or the gallery. Avoid adding two more columns inside the already dense three-column notice hub.

Desktop: document list on the left, calendar panel on the right. Below 1024px: stack calendar first (time-sensitive) then documents, matching DOM and keyboard order. Use the existing Inter/Roboto, primary blue, light blue, white, stroke tokens and shared SVG loader. CTA actions use shared button variant 12. No extra decorative numbering from the reference screenshot.

## Data and links

Documents: show the four newest non-form records currently represented in `pages/documents-forms.html`, with exactly matching title, code and issue date, newest first. Each preview links to its actual library-row anchor, rather than the unrelated generic detail page. Preserve document primitive variants 1–4; make their existing IDs usable with sticky header anchor offsets.

Calendar: user explicitly plans to provide the real source. Render the informative empty state and contact action now. No fictional events, misleading “this week” dates, dead previous/next controls or invented full-calendar URL. Link the existing staff-services calendar tile to `#weekly-schedule`, with copy that promises only the calendar and events shown here. Appointment data and full-calendar navigation await the user's real source.

## Implementation checklist

- [x] Inspect current homepage, user's uncommitted staff-services change, notice hub, document library, common event cards, primitives and calendar destinations.
- [x] Add the compact document primitive and work-updates block; insert at the chosen location.
- [x] Point the existing calendar tile at the new section.
- [x] Verify links/data/primitive integration, production build, focused regressions and desktop/mobile rendering where browser tools are available.

No new runtime dependency, global style or calendar backend. Existing event cards require imagery and are unsuitable for the reference's compact agenda; do not reuse them solely by name.

## Verification results

- `FACULTY=organization-administration npm run build`: passed.
- Four focused organization administration regressions (faculty contract, page inventory, partners placement, homepage destinations): passed.
- Checked built HTML: work-updates is between notice-hub and news, every nested include resolves, four latest document records exactly match library metadata, all target IDs exist, and the calendar anchor is unique.
- Chrome desktop and responsive 375px visual checks: two columns on desktop; calendar then documents on mobile; long titles wrap and full-width primitive CTAs fit.
- Read-only independent review: no important findings.
- Calendar source remains intentionally pending per user instruction. No actual calendar events or complete-calendar route were supplied or invented.
