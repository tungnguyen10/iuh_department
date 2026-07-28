# Dormitory Lookup Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present dormitory lookup data in a responsive two-column profile and a four-tab activity area with complete KTX history tables.

**Architecture:** Reuse the existing lookup profile, stay-history, registration row, form table, and shared tabs primitives. Add semantic grouping classes to the lookup markup; keep all page composition in `tra-cuu.html`; let the existing shared tabs JavaScript manage panel visibility.

**Tech Stack:** Static HTML includes, Tailwind CSS via SCSS `@apply`, shared `Tabs` JavaScript, Vite build.

## Global Constraints

- Preserve IUH design-system colours, type, table and tab primitives; do not introduce a new UI library.
- On desktop, identity fields use two columns; on mobile they collapse to one column.
- Status and Registration remain full width.
- `Lịch sử ở KTX` is the selected initial tab; its two tables use the supplied sample data.
- `Điểm danh`, `Thông tin kỷ luật`, and `Thông tin khen thưởng` each say `Chưa có dữ liệu`.

---

### Task 1: Structure the profile display grid

**Files:**
- Modify: `src/faculties/dormitory-management/components/lookup/profile-panel/index.html`
- Modify: `src/faculties/dormitory-management/components/lookup/lookup.scss`

**Interfaces:**
- Consumes: Existing `@shared/components/form/display-row.html` include properties.
- Produces: `.iuh-lookup-panel__identity-grid` and `.iuh-lookup-panel__full-row` selectors used only by the lookup panel.

- [ ] **Step 1: Add the identity-grid and full-row markup hooks**

Wrap the first six display-row includes in a `div.iuh-lookup-panel__identity-grid`; add `row-class="iuh-lookup-panel__full-row"` to Status and each Registration include so those entries span the enclosing display.

- [ ] **Step 2: Add responsive grid styles**

```scss
.iuh-lookup-panel__identity-grid {
  @apply grid grid-cols-1 divide-y divide-stroke md:grid-cols-2 md:divide-x md:divide-y-0;
}

.iuh-lookup-panel__identity-grid .iuh-form-display-row {
  @apply min-w-0;
}
```

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: the build completes with exit code 0.

### Task 2: Add lookup activity tabs and KTX history tables

**Files:**
- Modify: `src/faculties/dormitory-management/pages/tra-cuu.html`
- Modify: `src/faculties/dormitory-management/components/lookup/stay-history/index.html`
- Modify: `src/faculties/dormitory-management/components/lookup/lookup.scss`

**Interfaces:**
- Consumes: Shared `Tabs` convention: `.tabs-container`, `.tab-btn[data-tab]`, and `.tab-panel[data-tab-panel]`.
- Produces: Four accessible button/panel pairs, with `stay-history` selected initially.

- [ ] **Step 1: Compose the tab navigation in the lookup page**

Create buttons in this order: `attendance`, `discipline`, `commendation`, and `stay-history`. Mark only the last button with `active`; match the shared tab classes used in faculty pages. Add matching panels, marking the first three panels `hidden` and keeping the history panel visible.

- [ ] **Step 2: Render the two history tables**

Keep the existing occupancy table as the first table with columns `TT`, `Thời gian`, `Trạng thái`. Add a `Lịch sử đăng ký` heading and its five-column table beneath it: `TT`, `Đợt đăng ký`, `Ngày đăng ký`, `Trạng thái`, `Ghi chú`. Use the five supplied sample rows and the existing table cell classes.

- [ ] **Step 3: Add empty-panel and tab spacing styles**

```scss
.iuh-lookup-tabs__empty {
  @apply rounded-lg border border-dashed border-stroke bg-white px-4 py-10 text-center font-sans text-sm font-medium text-gray-500;
}
```

Keep the navigation horizontally scrollable and leave table responsiveness to `.iuh-form-table-wrap`.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: the build completes with exit code 0.

### Task 3: Verify the compiled lookup page

**Files:**
- Verify: compiled output of `src/faculties/dormitory-management/pages/tra-cuu.html`

**Interfaces:**
- Consumes: The Vite build output and source markup from Tasks 1–2.
- Produces: Evidence that the markup is complete and tab selectors match the shared JavaScript.

- [ ] **Step 1: Validate tabs and panel relationships**

Run: `rg -n 'data-tab="(attendance|discipline|commendation|stay-history)"|data-tab-panel="(attendance|discipline|commendation|stay-history)"' src/faculties/dormitory-management/pages/tra-cuu.html`

Expected: four tab buttons and four matching panel attributes.

- [ ] **Step 2: Validate no empty template placeholders appear in the history component**

Run: `rg -n '\{\{[^}]+\}\}' src/faculties/dormitory-management/components/lookup/stay-history/index.html`

Expected: no output, because the static history data is written directly.

- [ ] **Step 3: Review the working tree**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the intended lookup source files are changed, plus pre-existing user changes.
