# Organization Administration Navigation and Related Pages Design

## Goal

Align the Phòng Tổ chức – Hành chính navigation, existing pages, and internal links with the information architecture already established by the approved home page. Keep the current eight pages, improve their content and relationships, and add only the pages needed to give home-page calls to action accurate destinations.

## Scope

### Existing pages retained and updated

- `index.html`: preserve the approved section structure and visual direction; correct links only where needed.
- `about.html`: revise the overview content so it introduces the unit without duplicating the detailed responsibility page.
- `leadership.html`: align responsibilities and terminology with the five responsibility areas.
- `leadership-detail.html`: align the sample profile and responsibility wording with the leadership page.
- `news.html`: remain the unified listing for news and announcements.
- `news-detail.html`: remain the shared detail destination for news and announcements.
- `partners.html`: retain the page and expose it through footer, search, and contextual links rather than the primary navigation.
- `contact.html`: focus on contact channels and routing support requests to the appropriate responsibility area.

### New pages

- `functions-duties.html`: one consolidated page for the unit's role and five responsibility areas:
  - Tổ chức – Cán bộ
  - Hành chính – Tổng hợp
  - Văn thư – Lưu trữ
  - Chính sách – Thi đua
  - Lễ tân – Khánh tiết
- `documents-forms.html`: a focused landing page for processes, documents, and downloadable forms reflected by the home-page notice hub.
- `recruitment.html`: a focused landing page for IUH recruitment information reflected by the home-page notice hub.

The module will therefore expose eleven clean HTML pages.

## Information Architecture

The primary navigation will be:

1. `TRANG CHỦ` → `/`
2. `GIỚI THIỆU`
   - `Tổng quan` → `/about.html`
   - `Chức năng – Nhiệm vụ` → `/functions-duties.html`
   - `Ban lãnh đạo` → `/leadership.html`
3. `LĨNH VỰC PHỤ TRÁCH`
   - five links to anchors on `/functions-duties.html`
4. `TIN TỨC – THÔNG BÁO` → `/news.html`
5. `VĂN BẢN – BIỂU MẪU` → `/documents-forms.html`
6. `TUYỂN DỤNG` → `/recruitment.html`
7. `LIÊN HỆ` → `/contact.html`

`Đối tác` remains available through the footer, search, and relevant page content. This keeps the primary navigation focused on the unit's core public services and prevents an overly wide desktop navigation row.

## Link Mapping

- All five responsibility cards on the home page link to their matching section on `functions-duties.html`.
- Notice and news links continue to use `news.html` and `news-detail.html`.
- Process and form links use `documents-forms.html`; temporary download actions must not misleadingly point to the contact page.
- Recruitment links use `recruitment.html`.
- Help and reception calls to action use `contact.html` when the action is genuinely a support request.
- Header quick links, footer links, and search shortcuts use the same vocabulary and destinations as the main navigation.

## Page Design

The approved index is the visual reference. Related pages will reuse existing shared components and project tokens instead of introducing a second visual system.

- Typography: Inter for headings and Roboto for body and utility text.
- Color: existing IUH dark blue, yellow accent, white surfaces, light-blue section backgrounds, and existing neutral text colors.
- Layout: standard container widths, clear uppercase section headings, alternating white/light-blue sections, and compact bordered cards matching the responsibility and notice sections on the index.
- Interaction: visible keyboard focus, restrained hover movement, and reduced-motion-safe transitions.
- Copy: direct Vietnamese labels that match what staff and applicants are trying to find. Remove generic or cross-domain wording that does not belong to organization administration.

The signature element remains the five responsibility-area taxonomy established on the home page. It becomes the organizing device for the functions page, contact routing, leadership responsibilities, quick links, and contextual navigation.

## Data and Component Boundaries

- Navigation, quick links, footer links, search categories, and identity stay in `data/site.json`.
- Page-specific static content stays in faculty-owned HTML pages.
- Existing shared breadcrumb, section-title, news, leadership, form, partners, header, and footer components are reused.
- Faculty-specific home components are updated only where their links conflict with the revised information architecture.
- No new JavaScript runtime module is required unless the existing build reveals a concrete interaction gap.

## Error and Empty-State Handling

- Every internal navigation target must correspond to a built route.
- Anchor links must point to stable, unique section IDs.
- Document entries without real files are labelled `Đang cập nhật` and have no download control.
- Recruitment and document pages explicitly state when published items are sample content or when no current item is available.

## Verification

- Update the organization-administration route contract test from eight to eleven pages.
- Assert that navigation, quick links, footer links, and index calls to action use built routes.
- Assert that the five responsibility areas appear consistently on the home page and functions page.
- Assert that obsolete mappings from responsibility, document, or recruitment content to generic `news.html`/`contact.html` destinations are removed.
- Run the organization-administration tests, the site-chrome link tests, the full test suite, and a production build with `FACULTY=organization-administration`.
- Inspect representative desktop and mobile renders of the home page, dropdown navigation, and new pages before completion.

## Non-Goals

- Replacing the approved home-page layout or visual identity.
- Adding a CMS, backend form handling, authentication, or real document storage.
- Inventing official personnel, contact, recruitment, or policy data not supplied by the unit.
- Refactoring unrelated shared components or other faculty modules.
