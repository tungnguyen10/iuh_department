# IDCS Updates two-block design

## Goal

Show industry news sourced from IDC and legal documents together on the IDCS homepage. News has the stronger visual priority; documents remain easy to scan without a tab click.

## Approved layout

- Desktop: a two-column composition, roughly 7/12 for news and 5/12 for documents.
- News: one featured article with a larger image and two compact articles below it, in source order.
- Documents: four compact rows, in the same order and with the same destinations as the existing homepage data.
- Mobile: stack news first, then documents. Both lists remain visible.
- Each block has its own heading and “Xem tất cả” link. No tabs or hidden panels.

## Visual direction

The section uses the existing IUH blue, pale blue, yellow focus accent, Inter headings and Roboto body text. News sits directly on white with a substantial lead image, a prominent headline and two small previews below. The document list occupies one pale blue surface. Avoid nested card frames, shadows and flashing “New” badges. Both archive links keep their text and arrow on one line.

## Components and data

Use the shared `section-title` for the section introduction, `button` for both archive links, `data-news-sidebar-items` with `data-news-layout="editorial"` for news, and `document-item` variant 6 for document rows. These are opt-in variants; existing sidebar and document presentations keep their defaults.

Four news records were imported from `https://idccenter.gov.vn/` on 2026-10-13: Samsung investment and industrial support, northern-region industrial extension, VITW/Hanoi MIP Fair 2026, and the TASK technical advisory project. Store concise summaries, original publication dates, local images, image provenance and source links in `news.json`. Keep search results synchronized with the new article slugs. The homepage displays the first three records; all four have local detail pages with links to their source. This is a static content snapshot.

## Behavior and checks

Both blocks are present in the initial HTML. Keyboard focus remains visible on item links and archive links. Responsive layout must not overflow at mobile widths. Update the IDCS component tests to assert two visible blocks and the absence of tab semantics. Build IDCS and inspect desktop and mobile screenshots.
