# Organization Administration Navigation and Related Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Phòng Tổ chức – Hành chính navigation and all related pages with the approved index, retain the existing eight pages, and add focused pages for functions, documents/forms, and recruitment.

**Architecture:** Keep shared site chrome and shared content components unchanged. Store the revised information architecture in the faculty-owned `data/site.json`, add three static faculty-owned page files, and update only the faculty home components and existing page content whose destinations or vocabulary conflict with the index taxonomy.

**Tech Stack:** Vite 7, static HTML includes, Vanilla JavaScript, TailwindCSS 3, Node.js test runner.

## Global Constraints

> **Execution amendment (approved 2026-09-05):** Use current operational content and published IUH identity/contact/personnel data. Remove all placeholder and `minh họa` copy. When no local file or active recruitment record exists, link users to the real E-Office, news, or department contact pathway instead of displaying fabricated records or `Đang cập nhật`. This amendment supersedes conflicting sample-data steps later in this plan.

- Preserve the approved `index.html` section order and visual direction.
- Keep all eight existing HTML pages and add exactly `functions-duties.html`, `documents-forms.html`, and `recruitment.html`.
- Use Inter for headings, Roboto for body and utility text, and existing IUH design tokens only.
- Reuse existing shared breadcrumbs, section titles, news, leadership, forms, partners, header, and footer components.
- Do not add a CMS, backend form handling, authentication, real document storage, or a new runtime JavaScript module.
- Do not invent official personnel, contact, recruitment, document, or policy data; explicitly label illustrative content.
- Document items with no file must display `Đang cập nhật` and must not render a download control.
- All internal links must resolve to a built route; responsibility anchors must use stable, unique IDs.

## File Map

- Create `src/faculties/organization-administration/pages/functions-duties.html`: consolidated function and five-area responsibility page.
- Create `src/faculties/organization-administration/pages/documents-forms.html`: process, document, and form landing page with honest unavailable states.
- Create `src/faculties/organization-administration/pages/recruitment.html`: IUH recruitment landing page and empty/sample-state guidance.
- Modify `src/faculties/organization-administration/data/site.json`: primary navigation, quick links, footer, and search destinations.
- Modify `src/faculties/organization-administration/data/search-data.json`: searchable records for the three new pages and revised terminology.
- Modify `src/faculties/organization-administration/components/home/responsibility-areas/index.html`: map all five cards to responsibility anchors.
- Modify `src/faculties/organization-administration/components/home/notice-hub/index.html`: route forms and recruitment content to their focused pages; remove fake download actions.
- Modify `src/faculties/organization-administration/pages/about.html`: concise overview linked to the detailed function page.
- Modify `src/faculties/organization-administration/pages/leadership.html`: align responsibility wording with the five-area taxonomy.
- Modify `src/faculties/organization-administration/pages/leadership-detail.html`: keep profile terminology consistent with the leadership listing.
- Modify `src/faculties/organization-administration/pages/contact.html`: route requests by the five responsibility areas.
- Modify `src/faculties/organization-administration/pages/news.html`: use the approved `Tin tức – Thông báo` label consistently.
- Modify `src/faculties/organization-administration/pages/news-detail.html`: use the same parent label and metadata.
- Modify `tests/organization-administration-faculty.test.js`: page, taxonomy, navigation, and CTA contracts.
- Modify `tests/site-chrome-build.test.js`: expected production page count.

---

### Task 1: Add the three focused routes and their page contracts

**Files:**
- Create: `src/faculties/organization-administration/pages/functions-duties.html`
- Create: `src/faculties/organization-administration/pages/documents-forms.html`
- Create: `src/faculties/organization-administration/pages/recruitment.html`
- Modify: `tests/organization-administration-faculty.test.js`
- Modify: `tests/site-chrome-build.test.js`

**Interfaces:**
- Consumes: existing `LAYOUT` metadata parsing and shared `breadcrumb.html`/`section-title.html` includes.
- Produces: built routes `/functions-duties.html`, `/documents-forms.html`, and `/recruitment.html`; anchor IDs `organization-personnel`, `administration-general`, `records-archives`, `policy-emulation`, and `reception-protocol`.

- [ ] **Step 1: Write the failing route and content tests**

Add the three filenames to `expectedPages`, update the test name to `provides eleven clean pages`, and add:

```js
test('organization administration adds focused pages for index destinations', async () => {
  const [functionsPage, documentsPage, recruitmentPage] = await Promise.all([
    readFacultyFile('pages/functions-duties.html'),
    readFacultyFile('pages/documents-forms.html'),
    readFacultyFile('pages/recruitment.html'),
  ])

  for (const id of [
    'organization-personnel',
    'administration-general',
    'records-archives',
    'policy-emulation',
    'reception-protocol',
  ]) assert.match(functionsPage, new RegExp(`id=["']${id}["']`))

  assert.match(documentsPage, /Văn bản – Biểu mẫu/)
  assert.match(documentsPage, /Đang cập nhật/)
  assert.doesNotMatch(documentsPage, /href=["']#["']/)
  assert.match(recruitmentPage, /Tuyển dụng IUH/)
})
```

Change the organization-administration entry in `tests/site-chrome-build.test.js`:

```js
'organization-administration': 11,
```

- [ ] **Step 2: Run the focused tests and verify the route contract fails**

Run:

```bash
node --test tests/organization-administration-faculty.test.js tests/site-chrome-build.test.js
```

Expected: FAIL because the three page files do not exist and the built page count is still 8.

- [ ] **Step 3: Create `functions-duties.html`**

Use one breadcrumb, an introductory section, and five alternating responsibility sections. Each section must follow this exact identity contract:

```html
<!-- LAYOUT: title="Chức năng – Nhiệm vụ" -->
<!-- LAYOUT: description="Chức năng, nhiệm vụ và các lĩnh vực phụ trách của Phòng Tổ chức – Hành chính IUH." -->
<!-- LAYOUT: keywords="chức năng nhiệm vụ, tổ chức cán bộ, hành chính, văn thư lưu trữ IUH" -->
<!-- LAYOUT: url="https://iuh.edu.vn/functions-duties" -->
<!-- LAYOUT: ogImage="/assets/images/default.jpg" -->

<div data-include="@shared/components/common/breadcrumb.html" data-parent-page1="Trang chủ" data-parent-link1="/" data-current-page="Chức năng – Nhiệm vụ" data-parent-page2="" data-parent-link2="" data-parent-page2-class=""></div>

<section class="container mx-auto px-4 py-10 md:py-16">
  <div data-include="@shared/components/common/section-title.html" data-subtitle="Phòng Tổ chức – Hành chính" data-title="Chức năng – Nhiệm vụ" data-description="Đầu mối tham mưu và phối hợp công tác tổ chức, cán bộ và hành chính của nhà trường."></div>
  <nav aria-label="Các lĩnh vực phụ trách" class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <a href="#organization-personnel">Tổ chức – Cán bộ</a>
    <a href="#administration-general">Hành chính – Tổng hợp</a>
    <a href="#records-archives">Văn thư – Lưu trữ</a>
    <a href="#policy-emulation">Chính sách – Thi đua</a>
    <a href="#reception-protocol">Lễ tân – Khánh tiết</a>
  </nav>
</section>
```

For the five content sections, use these exact ID/icon/title mappings. Each section contains one `h2`, a two-to-three sentence illustrative description, and a short unordered list of responsibilities; apply `scroll-mt-32` to each section so anchored navigation clears the sticky header.

| Section ID | SVG | Heading |
| --- | --- | --- |
| `organization-personnel` | `/assets/svgs/responsibility-organization.svg` | `Tổ chức – Cán bộ` |
| `administration-general` | `/assets/svgs/responsibility-administration.svg` | `Hành chính – Tổng hợp` |
| `records-archives` | `/assets/svgs/responsibility-records.svg` | `Văn thư – Lưu trữ` |
| `policy-emulation` | `/assets/svgs/responsibility-policy.svg` | `Chính sách – Thi đua` |
| `reception-protocol` | `/assets/svgs/responsibility-reception.svg` | `Lễ tân – Khánh tiết` |

Use the following illustrative responsibility copy so no official policy is implied:

| Heading | Description | List items |
| --- | --- | --- |
| Tổ chức – Cán bộ | Tham mưu về cơ cấu tổ chức, vị trí việc làm và công tác cán bộ, viên chức, người lao động. | Rà soát cơ cấu và chức năng đơn vị; hướng dẫn hồ sơ nhân sự; phối hợp quản lý dữ liệu đội ngũ. |
| Hành chính – Tổng hợp | Điều phối công tác hành chính và tổng hợp thông tin phục vụ hoạt động chung của nhà trường. | Tổng hợp kế hoạch, báo cáo; phối hợp điều kiện làm việc; theo dõi công việc hành chính. |
| Văn thư – Lưu trữ | Hướng dẫn tiếp nhận, phát hành, quản lý và lưu trữ văn bản, hồ sơ theo quy định. | Quản lý văn bản đến – đi; hướng dẫn lập hồ sơ; phối hợp lưu trữ và khai thác hồ sơ. |
| Chính sách – Thi đua | Phối hợp thực hiện chế độ, chính sách và công tác thi đua, khen thưởng đối với đội ngũ. | Hướng dẫn hồ sơ chế độ; tổng hợp đề xuất thi đua; theo dõi tiến độ xử lý. |
| Lễ tân – Khánh tiết | Phối hợp lễ tân, đón tiếp và khánh tiết cho các hoạt động chung của nhà trường. | Tiếp nhận nhu cầu đón tiếp; phối hợp tổ chức sự kiện; chuẩn bị điều kiện lễ tân. |

Use existing classes from the home responsibility cards: `rounded-xl border border-stroke bg-primary-white`, `text-primary-dark-blue`, and alternating `bg-secondary-blue-light/40` wrappers. End with a CTA to `/contact.html` labelled `Liên hệ đúng đầu mối`.

- [ ] **Step 4: Create `documents-forms.html`**

Create metadata and a breadcrumb labelled `Văn bản – Biểu mẫu`, followed by three category cards: `Quy trình`, `Văn bản hướng dẫn`, and `Biểu mẫu`. Render illustrative entries as non-link rows using this complete unavailable-state pattern:

```html
<article class="flex items-center gap-4 rounded-xl border border-stroke bg-primary-white p-4">
  <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary-blue-light">
    <img src="/assets/svgs/icon-file-word.svg" alt="" class="size-6" />
  </span>
  <div class="min-w-0 flex-1">
    <h2 class="font-inter font-semibold text-title">Quản lý cấp phòng</h2>
    <p class="mt-1 font-roboto text-sm text-gray-700">Nội dung minh họa, chưa có tệp phát hành.</p>
  </div>
  <span class="shrink-0 rounded-full bg-gray-light px-3 py-1 font-roboto text-xs font-semibold text-gray-700">Đang cập nhật</span>
</article>
```

Include entries for the six form groups already present on the index: Quản lý cấp phòng, Đi nước ngoài, Bảo hiểm xã hội, Chế độ – Chính sách, Đào tạo – Bồi dưỡng, and Nâng bậc lương. End with a `/contact.html` CTA for document guidance.

- [ ] **Step 5: Create `recruitment.html`**

Create metadata and a breadcrumb labelled `Tuyển dụng IUH`. Include an intro card stating `Các vị trí dưới đây là dữ liệu minh họa giao diện, không phải thông báo tuyển dụng đang có hiệu lực.` Render the three existing sample titles—`Giảng viên ngành Công nghệ thông tin`, `Chuyên viên Phòng Tổ chức – Hành chính`, and `Chuyên viên Văn thư – Lưu trữ`—as non-actionable rows using `icon-briefcase.svg` and the availability label `Đã hết hạn · Minh họa`. The page must end with links to `/news.html` (`Xem thông báo mới`) and `/contact.html` (`Liên hệ về tuyển dụng`). Do not add application submission behavior.

- [ ] **Step 6: Run focused route tests**

Run:

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: PASS with eleven sorted page filenames and all focused-page assertions passing.

- [ ] **Step 7: Commit the new route slice**

```bash
git add tests/organization-administration-faculty.test.js tests/site-chrome-build.test.js src/faculties/organization-administration/pages/functions-duties.html src/faculties/organization-administration/pages/documents-forms.html src/faculties/organization-administration/pages/recruitment.html
git commit -m "feat: add organization administration resource pages"
```

---

### Task 2: Replace the menu and support links with the approved information architecture

**Files:**
- Modify: `src/faculties/organization-administration/data/site.json`
- Modify: `src/faculties/organization-administration/data/search-data.json`
- Modify: `tests/organization-administration-faculty.test.js`

**Interfaces:**
- Consumes: the three routes and five anchors created by Task 1; site schema version 1.
- Produces: recursive `navigation`, revised `quickLinks`, footer links, and search links consumed by the shared site-chrome renderer.

- [ ] **Step 1: Write the failing information-architecture test**

Add:

```js
test('organization administration chrome follows the index information architecture', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))

  assert.deepEqual(site.navigation.map(({ text }) => text), [
    'TRANG CHỦ',
    'GIỚI THIỆU',
    'LĨNH VỰC PHỤ TRÁCH',
    'TIN TỨC – THÔNG BÁO',
    'VĂN BẢN – BIỂU MẪU',
    'TUYỂN DỤNG',
    'LIÊN HỆ',
  ])
  assert.deepEqual(site.navigation[1].children.map(({ href }) => href), [
    '/about.html',
    '/functions-duties.html',
    '/leadership.html',
  ])
  assert.deepEqual(site.navigation[2].children.map(({ href }) => href), [
    '/functions-duties.html#organization-personnel',
    '/functions-duties.html#administration-general',
    '/functions-duties.html#records-archives',
    '/functions-duties.html#policy-emulation',
    '/functions-duties.html#reception-protocol',
  ])
  assert.ok(site.footer.columns.flatMap(({ links }) => links).some(({ href }) => href === '/partners.html'))
  assert.ok(site.search.quickLinks.some(({ href }) => href === '/documents-forms.html'))
  assert.ok(site.search.quickLinks.some(({ href }) => href === '/recruitment.html'))
})
```

- [ ] **Step 2: Verify the existing menu fails the new contract**

Run:

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: FAIL because `GIỚI THIỆU` is currently a direct link and the new routes are absent from the menu/search data.

- [ ] **Step 3: Update `site.json`**

Replace `quickLinks` and `navigation` with:

```json
"quickLinks": [
  { "text": "Chức năng – Nhiệm vụ", "href": "/functions-duties.html", "icon": "icon-article.svg" },
  { "text": "Văn bản – Biểu mẫu", "href": "/documents-forms.html", "icon": "icon-file-word.svg" },
  { "text": "Tuyển dụng IUH", "href": "/recruitment.html", "icon": "icon-briefcase.svg" },
  { "text": "Liên hệ hỗ trợ", "href": "/contact.html", "icon": "icon-building.svg" }
],
"navigation": [
  { "text": "TRANG CHỦ", "href": "/" },
  { "text": "GIỚI THIỆU", "children": [
    { "text": "Tổng quan", "href": "/about.html" },
    { "text": "Chức năng – Nhiệm vụ", "href": "/functions-duties.html" },
    { "text": "Ban lãnh đạo", "href": "/leadership.html" }
  ] },
  { "text": "LĨNH VỰC PHỤ TRÁCH", "children": [
    { "text": "Tổ chức – Cán bộ", "href": "/functions-duties.html#organization-personnel" },
    { "text": "Hành chính – Tổng hợp", "href": "/functions-duties.html#administration-general" },
    { "text": "Văn thư – Lưu trữ", "href": "/functions-duties.html#records-archives" },
    { "text": "Chính sách – Thi đua", "href": "/functions-duties.html#policy-emulation" },
    { "text": "Lễ tân – Khánh tiết", "href": "/functions-duties.html#reception-protocol" }
  ] },
  { "text": "TIN TỨC – THÔNG BÁO", "href": "/news.html" },
  { "text": "VĂN BẢN – BIỂU MẪU", "href": "/documents-forms.html" },
  { "text": "TUYỂN DỤNG", "href": "/recruitment.html" },
  { "text": "LIÊN HỆ", "href": "/contact.html" }
]
```

Replace `footer.columns`, `search.quickLinks`, and `search.categories` with these values; preserve `footer.socialLinks` unchanged:

```json
"columns": [
  { "title": "Nghiệp vụ", "links": [
    { "text": "Chức năng – Nhiệm vụ", "href": "/functions-duties.html" },
    { "text": "Văn bản – Biểu mẫu", "href": "/documents-forms.html" },
    { "text": "Tuyển dụng IUH", "href": "/recruitment.html" }
  ] },
  { "title": "Tra cứu – Hỗ trợ", "links": [
    { "text": "Tin tức – Thông báo", "href": "/news.html" },
    { "text": "Liên hệ đúng đầu mối", "href": "/contact.html" },
    { "text": "Đối tác hợp tác", "href": "/partners.html" }
  ] },
  { "title": "Thông tin", "links": [
    { "text": "Tổng quan", "href": "/about.html" },
    { "text": "Ban lãnh đạo", "href": "/leadership.html" },
    { "text": "Trang chủ", "href": "/" }
  ] }
],
"quickLinks": [
  { "text": "Chức năng – Nhiệm vụ", "href": "/functions-duties.html" },
  { "text": "Văn bản – Biểu mẫu", "href": "/documents-forms.html" },
  { "text": "Tuyển dụng IUH", "href": "/recruitment.html" },
  { "text": "Tin tức – Thông báo", "href": "/news.html" },
  { "text": "Liên hệ", "href": "/contact.html" },
  { "text": "Đối tác hợp tác", "href": "/partners.html" }
],
"categories": [
  { "text": "Giới thiệu", "href": "/about.html", "icon": "GT" },
  { "text": "Lĩnh vực phụ trách", "href": "/functions-duties.html", "icon": "LV" },
  { "text": "Văn bản – Biểu mẫu", "href": "/documents-forms.html", "icon": "VB" },
  { "text": "Tuyển dụng", "href": "/recruitment.html", "icon": "TD" },
  { "text": "Ban lãnh đạo", "href": "/leadership.html", "icon": "LĐ" },
  { "text": "Liên hệ", "href": "/contact.html", "icon": "LH" }
]
```

- [ ] **Step 4: Add search records for the new routes**

Preserve the existing JSON record schema and add these records after ID 8, renumbering the existing news records from IDs 9–12 to IDs 12–15:

```json
{ "id": 9, "title": "Chức năng – Nhiệm vụ", "excerpt": "Tổ chức – Cán bộ; Hành chính – Tổng hợp; Văn thư – Lưu trữ; Chính sách – Thi đua; Lễ tân – Khánh tiết.", "category": "Trang", "date": "05/09/2026", "url": "/functions-duties.html" },
{ "id": 10, "title": "Văn bản – Biểu mẫu", "excerpt": "Tra cứu quy trình, văn bản hướng dẫn và biểu mẫu của Phòng Tổ chức – Hành chính.", "category": "Trang", "date": "05/09/2026", "url": "/documents-forms.html" },
{ "id": 11, "title": "Tuyển dụng IUH", "excerpt": "Thông tin và thông báo tuyển dụng của Trường Đại học Công nghiệp TP.HCM.", "category": "Trang", "date": "05/09/2026", "url": "/recruitment.html" }
```

- [ ] **Step 5: Run data and renderer tests**

Run:

```bash
node --test tests/organization-administration-faculty.test.js tests/site-chrome.test.js
```

Expected: PASS; anchor URLs validate by their `/functions-duties.html` pathname and all chrome links resolve.

- [ ] **Step 6: Commit the chrome data slice**

```bash
git add tests/organization-administration-faculty.test.js src/faculties/organization-administration/data/site.json src/faculties/organization-administration/data/search-data.json
git commit -m "feat: align organization administration navigation"
```

---

### Task 3: Correct all index calls to action

**Files:**
- Modify: `src/faculties/organization-administration/components/home/responsibility-areas/index.html`
- Modify: `src/faculties/organization-administration/components/home/notice-hub/index.html`
- Modify: `tests/organization-administration-faculty.test.js`

**Interfaces:**
- Consumes: focused routes and anchor IDs from Tasks 1–2.
- Produces: accurate index destinations without fake document downloads.

- [ ] **Step 1: Write the failing index-link test**

```js
test('organization administration index modules link to focused destinations', async () => {
  const [responsibilities, noticeHub] = await Promise.all([
    readFacultyFile('components/home/responsibility-areas/index.html'),
    readFacultyFile('components/home/notice-hub/index.html'),
  ])

  for (const id of [
    'organization-personnel',
    'administration-general',
    'records-archives',
    'policy-emulation',
    'reception-protocol',
  ]) assert.match(responsibilities, new RegExp(`href=["']/functions-duties\\.html#${id}["']`))

  assert.match(noticeHub, /href=["']\/documents-forms\.html["']/)
  assert.match(noticeHub, /href=["']\/recruitment\.html["']/)
  assert.doesNotMatch(noticeHub, /<a[^>]*href=["']\/contact\.html["'][^>]*aria-label=["']Tải xuống/)
})
```

- [ ] **Step 2: Verify the old generic mappings fail**

Run:

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: FAIL because responsibility cards use `/news.html`/`/contact.html` and the notice hub uses contact links for forms and recruitment.

- [ ] **Step 3: Map responsibility cards to exact anchors**

Replace card destinations in display order with:

```text
/functions-duties.html#organization-personnel
/functions-duties.html#administration-general
/functions-duties.html#records-archives
/functions-duties.html#policy-emulation
/functions-duties.html#reception-protocol
```

Keep card layout, icons, copy, focus styling, and animation unchanged.

- [ ] **Step 4: Replace document and recruitment destinations**

For each individual form row that has no real file, replace the blue download anchor with:

```html
<span class="shrink-0 rounded-full bg-gray-light px-2.5 py-1 font-roboto text-[10px] font-bold uppercase text-gray-700">Đang cập nhật</span>
```

Set the forms footer CTA to `/documents-forms.html`. Set each recruitment row and its footer CTA to `/recruitment.html`. Preserve all genuine news and announcement routes.

- [ ] **Step 5: Run the index-link tests**

Run:

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: PASS with five unique responsibility anchors and focused forms/recruitment routes.

- [ ] **Step 6: Commit the index link slice**

```bash
git add tests/organization-administration-faculty.test.js src/faculties/organization-administration/components/home/responsibility-areas/index.html src/faculties/organization-administration/components/home/notice-hub/index.html
git commit -m "fix: route organization administration home actions"
```

---

### Task 4: Align the eight retained pages with the index vocabulary

**Files:**
- Modify: `src/faculties/organization-administration/pages/about.html`
- Modify: `src/faculties/organization-administration/pages/leadership.html`
- Modify: `src/faculties/organization-administration/pages/leadership-detail.html`
- Modify: `src/faculties/organization-administration/pages/contact.html`
- Modify: `src/faculties/organization-administration/pages/news.html`
- Modify: `src/faculties/organization-administration/pages/news-detail.html`
- Verify unchanged: `src/faculties/organization-administration/pages/index.html`
- Verify unchanged structurally: `src/faculties/organization-administration/pages/partners.html`
- Modify: `tests/organization-administration-faculty.test.js`

**Interfaces:**
- Consumes: five responsibility names and new focused routes.
- Produces: consistent page metadata, breadcrumb labels, support-routing vocabulary, and contextual links.

- [ ] **Step 1: Write the failing retained-page consistency test**

```js
test('organization administration retained pages use the approved vocabulary', async () => {
  const [about, leadership, detail, contact, news, newsDetail] = await Promise.all([
    readFacultyFile('pages/about.html'),
    readFacultyFile('pages/leadership.html'),
    readFacultyFile('pages/leadership-detail.html'),
    readFacultyFile('pages/contact.html'),
    readFacultyFile('pages/news.html'),
    readFacultyFile('pages/news-detail.html'),
  ])

  assert.match(about, /href=["']\/functions-duties\.html["']/)
  for (const label of ['Tổ chức – Cán bộ', 'Hành chính – Tổng hợp', 'Văn thư – Lưu trữ', 'Chính sách – Thi đua', 'Lễ tân – Khánh tiết']) {
    assert.match(`${leadership}\n${detail}\n${contact}`, new RegExp(label))
  }
  assert.match(news, /Tin tức – Thông báo/)
  assert.match(newsDetail, /Tin tức – Thông báo/)
  assert.doesNotMatch(`${about}\n${leadership}\n${detail}\n${contact}`, /tư tưởng|nguồn lực hỗ trợ/i)
})
```

- [ ] **Step 2: Verify legacy wording fails**

Run:

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: FAIL because the pages do not yet expose all five area labels and still contain generic wording.

- [ ] **Step 3: Refocus the overview page**

Keep the existing two-section structure. Change the primary CTA to `/functions-duties.html` with label `Xem chức năng – nhiệm vụ`; add `/contact.html` as a secondary CTA. Replace the second section's four generic cards with a concise preview of the five approved areas and link the section to the consolidated page. Retain the existing default image and mark copy as illustrative where necessary.

- [ ] **Step 4: Align leadership listing and detail**

Keep the three shared `leader-board.html` includes and sample identities. Rewrite responsibilities so the three roles collectively cover the five approved areas verbatim. Remove `tư tưởng`, `truyền thông`, and vague `kết nối nguồn lực` language. On the detail page, preserve `data-leader-detail` and `data-leader-name`; replace the responsibility list with the same approved vocabulary and add a contextual link to `/functions-duties.html`.

- [ ] **Step 5: Align contact routing**

Replace the contact topic options with exactly:

```html
data-option1-value="organization-personnel" data-option1-text="Tổ chức – Cán bộ"
data-option2-value="administration-general" data-option2-text="Hành chính – Tổng hợp"
data-option3-value="records-archives" data-option3-text="Văn thư – Lưu trữ"
data-option4-value="policy-emulation" data-option4-text="Chính sách – Thi đua"
data-option5-value="reception-protocol" data-option5-text="Lễ tân – Khánh tiết"
```

Keep the form explicitly illustrative and leave submission behavior unchanged.

- [ ] **Step 6: Normalize news labels and metadata**

Use the exact en-dash label `Tin tức – Thông báo` in the news page title, breadcrumb, list title, detail parent breadcrumb, and relevant metadata. Do not change the shared news rendering components or `news.json` schema.

- [ ] **Step 7: Run the retained-page and full faculty tests**

Run:

```bash
node --test tests/organization-administration-faculty.test.js tests/shared-partners.test.js tests/search-links.test.js
```

Expected: PASS; all retained pages exist, partners remains reachable, and search links resolve.

- [ ] **Step 8: Commit the retained-page slice**

```bash
git add tests/organization-administration-faculty.test.js src/faculties/organization-administration/pages/about.html src/faculties/organization-administration/pages/leadership.html src/faculties/organization-administration/pages/leadership-detail.html src/faculties/organization-administration/pages/contact.html src/faculties/organization-administration/pages/news.html src/faculties/organization-administration/pages/news-detail.html
git commit -m "feat: align organization administration pages"
```

---

### Task 5: Production and visual verification

**Files:**
- Verify: all files modified in Tasks 1–4.
- Modify only if verification exposes a defect: the smallest faculty-owned file responsible for that defect.

**Interfaces:**
- Consumes: complete eleven-page faculty module.
- Produces: passing test/build evidence and responsive visual review evidence.

- [ ] **Step 1: Run the complete automated test suite**

Run:

```bash
corepack yarn test
```

Expected: all tests pass, including the 11-page production count and internal route checks.

- [ ] **Step 2: Run the selected-faculty production build**

Run:

```bash
FACULTY=organization-administration VITE_OUT_DIR=/tmp/iuh-organization-administration-build corepack yarn build
```

Expected: exit code 0; eleven HTML files are emitted with no unresolved includes or placeholders.

- [ ] **Step 3: Start the selected-faculty development server**

Run:

```bash
FACULTY=organization-administration corepack yarn dev --host 127.0.0.1 --port 5176
```

Expected: Vite reports `http://127.0.0.1:5176/` and remains running for browser inspection.

- [ ] **Step 4: Inspect representative desktop states**

At a 1440 × 1000 viewport, inspect `/`, `/functions-duties.html`, `/documents-forms.html`, `/recruitment.html`, and `/contact.html`. Verify:

- both dropdown menus open, stay within the viewport, and expose all expected links;
- responsibility anchors land below the sticky header;
- primary navigation remains on one usable row without overlap;
- the three new pages match index typography, colors, card borders, and section spacing;
- unavailable documents show `Đang cập nhật` with no download control.

- [ ] **Step 5: Inspect representative mobile states**

At a 390 × 844 viewport, inspect the same routes. Verify:

- the mobile navigation exposes both levels and every focused route;
- no horizontal overflow occurs;
- cards collapse to one readable column where appropriate;
- focus states are visible and no hover-only affordance hides information.

- [ ] **Step 6: Re-run focused verification after any visual correction**

If a defect required a code change, run:

```bash
node --test tests/organization-administration-faculty.test.js tests/site-chrome.test.js tests/site-chrome-build.test.js
FACULTY=organization-administration VITE_OUT_DIR=/tmp/iuh-organization-administration-build corepack yarn build
```

Expected: all tests pass and the build exits 0.

- [ ] **Step 7: Commit verification fixes, if any**

```bash
git add tests src/faculties/organization-administration
git commit -m "fix: polish organization administration responsive pages"
```

Skip this commit when verification required no code changes.
