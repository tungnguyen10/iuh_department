## 1. News Data

- [x] 1.1 Add selected-faculty `news.json` content for Health Science and Dormitory Management.
- [x] 1.2 Update selected-faculty search data so news entries link to news routes instead of placeholders.

## 2. Shared News Build Rendering

- [x] 2.1 Add build-time code that reads selected-faculty `news.json`.
- [x] 2.2 Render shared home section, list, detail, related carousel, and sidebar containers from selected-faculty news data during HTML transform.
- [x] 2.3 Keep shared carousel/swiper runtime initialization for the generated static markup.

## 3. Shared Markup

- [x] 3.1 Convert shared news section, carousel, and sidebar news/announcement components from hard-coded content to data-rendered containers.
- [x] 3.2 Add shared news detail and list shell components.

## 4. Faculty Integration

- [x] 4.1 Update Health Science news pages to include shared news list/detail shells while preserving routes.
- [x] 4.2 Update Dormitory Management home news usage and add Dormitory news list/detail pages using shared news shells.
- [x] 4.3 Update Dormitory navigation/search links to point to news routes where appropriate.

## 5. Verification

- [x] 5.1 Validate the OpenSpec change.
- [x] 5.2 Build Health Science and Dormitory Management and spot-check generated news content isolation.
