# Tasks - Audit Pages & Add Dormitory Faculty

## 1. Source tree hygiene (no behavior change)

- [x] 1.1 Update `.gitignore` to add patterns: `src/**/dist/`, `src/dist/`, `.tmp/`, `dist_*/`
- [x] 1.2 Remove leftover build outputs: `src/dist/`, `src/pages/dist/`, `dist_iuh/` (verify nothing important first)
- [x] 1.3 Verify `git ls-files | Select-String "src/.+/dist/"` returns empty
- [ ] 1.4 Commit hygiene cleanup as standalone commit

## 2. Page tier classification (audit & label)

- [x] 2.1 Add `<!-- TIER: ... -->` comment to top of every file in `src/pages/` per design.md mapping
- [x] 2.2 Move `src/pages/form.html` -> `src/pages/_dev/form.html` (mark tier `dev-only`)
- [x] 2.3 Document tier vocabulary in `.github/instructions/multi-faculty.instructions.md`

## 3. Build pipeline: support `_dev/` and `excludePages`

- [x] 3.1 In `vite.config.js`, update `collectFacultyPages()` to skip files under `pages/_dev/` for production builds
- [x] 3.2 In `loadFaculty()`, parse optional `excludePages` field with default `[]`
- [x] 3.3 In `collectFacultyPages()`, filter out pages whose basename is in `excludePages`
- [x] 3.4 Add nav-validation step in `loadFaculty()`: fail build if any nav `url` points to an excluded page
- [x] 3.5 Ensure dev server still serves `/_dev/*.html` routes
- [x] 3.6 Verify shared-template page (`news.html`) renders for a faculty without an override file

## 4. Faculty config schema update

- [x] 4.1 Update `loadFaculty()` validator to accept new optional `excludePages` field
- [x] 4.2 Verify `health-science/faculty.json` still validates (no excludePages field added)
- [x] 4.3 Add JSDoc/comment in `vite.config.js` near schema describing `excludePages`

## 5. Add second faculty: dormitory-management

- [x] 5.1 Create `src/faculties/dormitory-management/faculty.json` with id `dormitory-management`, name `Phòng Quản Lý Ký Túc Xá`, shortName `KTX`, contact info, brand colors (distinct from KKSK), social, nav, topBar, `excludePages: ["majors.html", "major-detail.html", "leadership-detail.html"]`
- [x] 5.2 Create `src/faculties/dormitory-management/pages/index.html` (faculty-content; new homepage content)
- [x] 5.3 Create `src/faculties/dormitory-management/pages/about.html` (faculty-content)
- [x] 5.4 Create `src/faculties/dormitory-management/pages/students.html` (faculty-content; rename/repurpose if more appropriate, or add to excludePages)
- [x] 5.5 Add `dev:dormitory-management` and `build:dormitory-management` scripts in `package.json`
- [x] 5.6 Update `build:all` to include `dormitory-management`

## 6. Component cascade verification

- [ ] 6.1 Audit faculty homepage: list shared components used and verify each works without override
- [x] 6.2 Add at least one faculty-specific component override (e.g. `intro/index.html`) using brand tokens
- [x] 6.3 Verify `@components/` alias still bypasses faculty cascade (no regression)

## 7. Smoke test new faculty

- [x] 7.1 Run `yarn build:dormitory-management` - exit code 0
- [x] 7.2 Verify `dist/dormitory-management/index.html` exists and contains "Phòng Quản Lý Ký Túc Xá"
- [x] 7.3 Verify excluded pages NOT in dist (`majors.html`, `major-detail.html`, `leadership-detail.html`)
- [x] 7.4 Verify shared `news.html`, `partners.html` exist in dist
- [x] 7.5 Inspect `<style>` in built HTML - confirm `--color-brand-primary` matches faculty.json (not KKSK values)
- [x] 7.6 Grep dist HTML for hardcoded "Khoa Khoa học Sức khỏe" text - must be 0 occurrences in identity slots
- [x] 7.7 Run `yarn build:health-science` - confirm KKSK build still works (regression check)
- [x] 7.8 Run `yarn build:all` - both faculties build successfully

## 8. Documentation

- [x] 8.1 Update README to list both faculties under build commands section
- [x] 8.2 Update `.github/instructions/multi-faculty.instructions.md` with `excludePages` field, `_dev/` convention, tier system
- [x] 8.3 Add a short "Adding a new faculty" checklist to README pointing at this change as reference

## 9. Validation & archive

- [x] 9.1 Run `openspec validate audit-pages-add-dormitory-faculty --strict` - passes
- [ ] 9.2 Manual review of dist/dormitory-management/ in browser via `yarn preview` or static server
- [x] 9.3 Archive change with `openspec archive audit-pages-add-dormitory-faculty`
