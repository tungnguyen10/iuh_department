## 1. Chromeless Layout Mode

- [x] 1.1 Add the `chrome="on" | "off"` marker handling to `layoutPlugin` in `vite.config.js`; default to `"on"` when absent.
- [x] 1.2 Update `src/shared/layouts/default.html` so the header include, footer include, search modal include, and scroll-to-top button can be conditionally rendered based on the chrome flag (split layout or token replacement, per the design).
- [x] 1.3 Verify default-chrome pages still render header, footer, search modal, and scroll-to-top correctly across both faculties.
- [x] 1.4 Add inline documentation in `default.html` (HTML comment) describing the chrome flag and its allowed values.

## 2. Mock Data

- [x] 2.1 Create `src/faculties/dormitory-management/data/lookup-mock.json` containing the reference student profile fields (name, MSSV, khoa, lớp, giới tính, năm nhập học, tình trạng), the registration state code, supporting copy, and a stay-history rows array (empty for the default fixture, a small populated example for the populated variant).
- [x] 2.2 Document the JSON shape near the file (README or comment in `faculty.config.js`).

## 3. Lookup Components

- [x] 3.1 Create `src/faculties/dormitory-management/components/lookup/profile-panel/index.html` rendering the "THÔNG TIN TRA CỨU" header and the two-column display rows for the student profile using the shared `display-row` primitive; the panel renders the five registration-row variants inline.
- [x] 3.2 Create `src/faculties/dormitory-management/components/lookup/registration-row/index.html` with five variants - `no_round`, `can_register`, `pending`, `approved`, `active` - per the design's state table.
- [x] 3.3 In the `approved` variant, embed the shared `file` primitive for the "Upload hình biên lai chuyển khoản" widget; ensure the upload action button uses the shared button include and the helper text explains the prototype scope.
- [x] 3.4 Create `src/faculties/dormitory-management/components/lookup/stay-history/index.html` with two variants - empty state ("Không có thông tin") and populated - using the shared `table` primitive.
- [x] 3.5 Confirm each component renders cleanly when included with the minimal set of `data-*` slots required by the spec.

## 4. Lookup Page Composition

- [x] 4.1 Create `src/faculties/dormitory-management/pages/tra-cuu.html` with the `<!-- LAYOUT: title="..." -->` marker so the page renders inside the standard public chrome (header + footer).
- [x] 4.2 Compose the page: page hero (eyebrow + heading + description), the profile-panel component, the stay-history component, and a final prototype-note `iuh-form-note` at the bottom.
- [x] 4.3 Wire the components to the mock data values via `data-*` attributes on the includes.
- [x] 4.4 Render every registration state stacked vertically as a static showcase (resolves the design's Open Question on state selection).

## 5. Login Wiring And Discoverability

- [x] 5.1 Add `<!-- LAYOUT: chrome="off" -->` to `pages/login.html` so the login surface stops rendering the public header, footer, search modal, and scroll-to-top widgets.
- [x] 5.2 Update the login form so submitting it lands the user on `/tra-cuu.html` (form `action`, `method`).
- [x] 5.3 Confirm `tra-cuu` does NOT appear in `faculty.config.js` header navigation, quick links, search categories, or `data/search-data.json`.

## 6. Verification

- [x] 6.1 Run OpenSpec validation for `add-dormitory-registration-lookup-page`.
- [x] 6.2 Run the selected build for `FACULTY=dormitory-management` and confirm both `login.html` and `tra-cuu.html` build successfully.
- [x] 6.3 Manually verify `login.html` renders without the public chrome and `tra-cuu.html` renders WITH the public chrome.
- [x] 6.4 Manually verify every Dormitory public page (home, about, news, news detail, contact, tra-cuu) still renders the public chrome correctly.
- [x] 6.5 Manually verify every registration-row state renders correctly on the stacked page.
- [x] 6.6 Manually verify the stay-history empty-state variant renders correctly.
- [x] 6.7 Run the selected build for `FACULTY=health-science` and confirm no regression on shared layout behavior.

## 7. Regression Guards

- [x] 7.1 Grep audit confirms the public site does not link to `tra-cuu.html` outside the login submit action.
- [x] 7.2 Grep audit confirms only `login.html` uses `chrome="off"` across both faculties.
- [x] 7.3 Grep audit confirms the `src/shared/components/auth/` directory does not exist.
