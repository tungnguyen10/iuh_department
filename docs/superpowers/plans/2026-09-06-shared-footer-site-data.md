# Shared Footer Site Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the expanded shared footer with the correct identity, navigation, social, map-address, home-link, and copyright data from every faculty's `site.json`.

**Architecture:** Keep `department.html` as the layout-only template and restore its existing `data-site-*` marker contract. Use `createSiteChromeRenderer` as the single rendering boundary so values remain escaped and faculty-relative links retain the selected faculty base path.

**Tech Stack:** HTML, JavaScript ES modules, Node.js test runner, Vite 7.

## Global Constraints

- Keep the current `<!-- Footer Component -->` layout.
- Do not hard-code faculty identity or faculty footer navigation in the shared template.
- Keep visit count, online count, Google Maps embed, branch list, section labels, and developer credit shared.
- Preserve the existing `site.json` schema and renderer interface.

---

### Task 1: Restore the footer marker contract

**Files:**
- Modify: `tests/site-chrome.test.js`
- Modify: `src/shared/components/footer/department.html`
- Modify: `src/shared/components/site-chrome/site-chrome-renderer.js`

**Interfaces:**
- Consumes: `createSiteChromeRenderer({ base, site }) => (html) => string` and the markers `data-site-home-link`, `data-site-footer-identity`, `data-site-map-address`, `data-site-footer-columns`, `data-site-social-links`, and `data-site-copyright`.
- Produces: a shared footer template whose faculty-dependent regions are renderer-owned.

- [x] **Step 1: Write the failing template contract test**

Add a test that reads `department.html`, asserts the `<!-- Footer Component -->` comment and all six marker names are present, then asserts representative hard-coded content such as `TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM`, `dhcn@iuh.edu.vn`, `Sinh viên`, and `/students.html` is absent.

- [x] **Step 2: Run the test to verify RED**

Run: `node --test --test-name-pattern="shared footer template" tests/site-chrome.test.js`

Expected: FAIL because the expanded template contains none of the footer data markers and still contains hard-coded faculty content.

- [x] **Step 3: Replace only dynamic regions with markers**

In `department.html`:

```html
<a href="/" data-site-home-link class="w-[200px] md:w-[180px] mx-auto md:mx-0">...</a>
<div class="flex flex-col gap-3 md:gap-4 flex-1" data-site-footer-identity></div>
<p class="flex-1 text-sm md:text-base text-gray-900 font-roboto" data-site-map-address></p>
<div class="contents" data-site-footer-columns></div>
<div class="contents" data-site-social-links></div>
<span data-site-copyright></span>
```

Keep the current stats, iframe, branches, headings, and developer credit unchanged.

- [x] **Step 4: Run the focused test to verify GREEN**

Run: `node --test --test-name-pattern="shared footer template" tests/site-chrome.test.js`

Expected: PASS.

### Task 2: Prove complete rendering for every faculty

**Files:**
- Modify: `tests/site-chrome.test.js`

**Interfaces:**
- Consumes: every faculty `data/site.json`, `department.html`, and `createSiteChromeRenderer`.
- Produces: regression coverage showing every configured footer field appears in rendered output.

- [x] **Step 1: Write a per-faculty renderer test**

For `health-science`, `dormitory-management`, `political-student-affairs`, and `organization-administration`, load the faculty site data, render the shared footer with `base: /<facultyId>/`, and assert every identity value and every text–URL pair. Also assert that mapped navigation links preserve the arrow affordance and mapped social links preserve their provider-specific hover colors.

```js
assert.match(rendered, new RegExp(escapeRegExp(site.identity.unitName)))
assert.match(rendered, new RegExp(escapeRegExp(site.identity.address)))
assert.match(rendered, new RegExp(escapeRegExp(site.identity.mapAddress)))
for (const column of site.footer.columns) {
  assert.match(rendered, new RegExp(escapeRegExp(column.title)))
  for (const link of column.links) assert.match(rendered, new RegExp(escapeRegExp(link.text)))
}
for (const link of site.footer.socialLinks) assert.match(rendered, new RegExp(escapeRegExp(link.text)))
assert.doesNotMatch(rendered, /data-site-/)
```

Also extend the shared-config loop to include `organization-administration`.

- [x] **Step 2: Run the focused test**

Run: `node --test tests/site-chrome.test.js`

Expected: PASS because Task 1 restored all renderer markers.

- [x] **Step 3: Run repository verification**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: Vite production build completes successfully for all configured faculty pages.

Verification result: all footer and all-faculty build tests pass. The full suite has one pre-existing, user-approved failure in `organization-administration retained pages use the approved vocabulary`, caused by `about.html` lacking a plain `/functions-duties.html` link.

- [x] **Step 4: Commit the implementation**

```bash
git add src/shared/components/footer/department.html src/shared/components/site-chrome/site-chrome-renderer.js tests/site-chrome.test.js docs/superpowers/plans/2026-09-06-shared-footer-site-data.md
git commit -m "fix: render shared footer from faculty data"
```
