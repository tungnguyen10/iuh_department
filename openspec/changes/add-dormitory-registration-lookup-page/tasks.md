## 1. Chromeless Layout Mode

- [ ] 1.1 Add the `chrome="on" | "off"` marker handling to `layoutPlugin` in `vite.config.js`; default to `"on"` when absent.
- [ ] 1.2 Update `src/shared/layouts/default.html` so the header include, footer include, search modal include, and scroll-to-top button can be conditionally rendered based on the chrome flag (split layout or token replacement, per the design).
- [ ] 1.3 Verify default-chrome pages still render header, footer, search modal, and scroll-to-top correctly across both faculties.
- [ ] 1.4 Add inline documentation in `default.html` (HTML comment) describing the chrome flag and its allowed values.

## 2. Shared Auth Action Bar

- [ ] 2.1 Create `src/shared/components/auth/action-bar.html` with slots for one or more action items (label, href, optional icon, optional `data-target="_self"`-style flags) and an active-state class hook.
- [ ] 2.2 Create accompanying styles (`action-bar.scss` or shared `iuh-auth-*` classes appended to `form.scss` / a new file, per repo convention).
- [ ] 2.3 Document the action bar in a short README under `src/shared/components/auth/` listing slots, variants, and a usage snippet.

## 3. Mock Data

- [ ] 3.1 Create `src/faculties/dormitory-management/data/lookup-mock.json` containing the reference student profile fields (name, MSSV, khoa, lớp, giới tính, năm nhập học, tình trạng), the registration state code, supporting copy, and a stay-history rows array (empty for the default fixture, a small populated example for the populated variant).
- [ ] 3.2 Document the JSON shape near the file (README or comment in `faculty.config.js`).

## 4. Lookup Components

- [ ] 4.1 Create `src/faculties/dormitory-management/components/lookup/profile-panel/index.html` rendering the "THÔNG TIN TRA CỨU" header and the two-column display rows for the student profile using the shared `display-row` primitive; the "Đăng ký" row slot accepts the registration-row component.
- [ ] 4.2 Create `src/faculties/dormitory-management/components/lookup/registration-row/index.html` with five variants - `no_round`, `can_register`, `pending`, `approved`, `active` - per the design's state table.
- [ ] 4.3 In the `approved` variant, embed the shared `file` primitive for the "Upload hình biên lai chuyển khoản" widget; ensure the upload action button uses the shared button include and the helper text explains the prototype scope.
- [ ] 4.4 Create `src/faculties/dormitory-management/components/lookup/stay-history/index.html` with two variants - empty state ("Không có thông tin") and populated - using the shared `table` primitive.
- [ ] 4.5 Confirm each component renders cleanly when included with the minimal set of `data-*` slots required by the spec.

## 5. Lookup Page Composition

- [ ] 5.1 Create `src/faculties/dormitory-management/pages/tra-cuu.html` with the `<!-- LAYOUT: title="..." -->` marker AND `<!-- LAYOUT: chrome="off" -->`.
- [ ] 5.2 Compose the page: shared auth action bar at the top, a page heading "Đăng ký nội trú", the profile-panel component, then the stay-history component, and a final prototype-note `iuh-form-note` at the bottom.
- [ ] 5.3 Wire the components to the mock data values (via component `data-*` attributes pulled from the JSON fixture; if the include engine cannot read JSON directly, inline the fixture values into the component invocations and link the JSON file from the README).
- [ ] 5.4 Add the optional `?state=` URL toggle if Decision 7 in the design selects that approach; otherwise mark which state the page renders by default and provide commented-out alternates.

## 6. Login Wiring And Discoverability

- [ ] 6.1 Add `<!-- LAYOUT: chrome="off" -->` to `pages/login.html` so the login surface stops rendering the public header, footer, search modal, and scroll-to-top widgets.
- [ ] 6.2 Update the login form so submitting it lands the user on `/tra-cuu.html` (form `action`, `method`, plus any minimal inline handler if needed for the static prototype).
- [ ] 6.3 Verify the "Đăng xuất" link in the auth action bar points to `/login.html`.
- [ ] 6.4 Confirm `tra-cuu` does NOT appear in `faculty.config.js` header navigation, quick links, search categories, or `data/search-data.json`.

## 7. Verification

- [ ] 7.1 Run OpenSpec validation for `add-dormitory-registration-lookup-page`.
- [ ] 7.2 Run the selected build for `FACULTY=dormitory-management` and confirm both `login.html` and `tra-cuu.html` build successfully.
- [ ] 7.3 Manually verify Dormitory `login.html` and `tra-cuu.html` render without the public chrome and still load shared meta, loading overlay, and main script.
- [ ] 7.4 Manually verify every Dormitory public page (home, about, news, news detail, contact) still renders the public chrome correctly.
- [ ] 7.5 Manually verify every registration-row state renders correctly (cycle through the toggle).
- [ ] 7.6 Manually verify the stay-history empty and populated variants render correctly.
- [ ] 7.7 Visual diff `tra-cuu.html` against both reference screenshots; capture before/after of `login.html` for the chrome change.
- [ ] 7.8 Run the selected build for `FACULTY=health-science` and confirm no regression on shared layout behavior.

## 8. Regression Guards

- [ ] 8.1 Grep audit confirms the public site does not link to `tra-cuu.html` outside the login submit action and the auth action bar.
- [ ] 8.2 Grep audit confirms no Dormitory page other than `login.html` and `tra-cuu.html` uses `chrome="off"`.
- [ ] 8.3 Grep audit confirms Health Science pages do not accidentally consume `chrome="off"`.
