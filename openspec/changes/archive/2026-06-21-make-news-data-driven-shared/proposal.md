## Why

News UI is currently split between shared components and faculty-owned wrappers, with several shared news/sidebar components still carrying Health Science-specific hard-coded content. Dormitory Management now needs the same news detail/list/card experience with different content, so news should become a shared feature driven by selected-faculty data instead of being copied per faculty.

## What Changes

- Move reusable news section, list, detail, carousel, and sidebar rendering toward shared components.
- Add selected-faculty `news.json` content data for Health Science and Dormitory Management.
- Update Dormitory news cards and search/navigation content to use shared news routes instead of temporary contact/home links.
- Remove Health Science-specific news copy from shared news and sidebar components.
- Preserve existing Health Science news routes and visual behavior while allowing Dormitory to render equivalent news detail content.

## Capabilities

### New Capabilities
- `shared-news-content`: Shared news presentation and selected-faculty news content data.

### Modified Capabilities
- `multi-faculty-architecture`: Shared components that differ only by news content must be data-driven instead of forked or hard-coded.
- `dormitory-management-faculty`: Dormitory news must render with the shared news experience and Dormitory-owned content.

## Impact

- Affected source: `src/shared/components/news`, `src/shared/components/sidebar`, selected faculty `pages`, selected faculty `data`, and faculty home/news composition.
- Build/runtime: selected faculty builds must continue to copy the selected faculty data and assets; no new external dependencies are expected.
- Verification: build Health Science and Dormitory Management, and spot-check generated news pages/content for faculty isolation.
