# Dormitory lookup tabs design

## Goal

Refine the authenticated dormitory lookup page so its student profile is easier to scan and its activity history is grouped under a clear tab interface.

## Scope

- Keep the existing dormitory lookup panel, display-row primitive, table primitive, and shared tabs behaviour.
- Lay out Student/MSSV, Faculty/Class, and Gender/Enrollment year as a two-column field grid on desktop. Collapse the grid to one column on small screens.
- Keep Status and Registration as full-width fields below the grid.
- Add four tabs: `Điểm danh`, `Thông tin kỷ luật`, `Thông tin khen thưởng`, and `Lịch sử ở KTX`.
- Select `Lịch sử ở KTX` initially. It contains an occupancy-history table and a registration-history table, using the values in the supplied reference.
- The other three tabs contain the shared empty state text `Chưa có dữ liệu`.

## Visual and interaction design

- Use the existing IUH white cards, blue border/heading treatment, Inter headings, and form/table token classes.
- Tab buttons use the shared `.tabs-container` mechanism, retain keyboard-native buttons, and become horizontally scrollable on narrow screens.
- Tables retain their existing horizontal overflow wrapper on small viewports.
- No new colour, typography, or standalone table system will be introduced.

## Files and boundaries

- `components/lookup/profile-panel/index.html`: add grouping hooks for the profile grid and full-width state fields.
- `components/lookup/stay-history/index.html`: render the two tables within the active history panel.
- `components/lookup/lookup.scss`: add only lookup-specific grid, tab, and empty-state styling.
- `pages/tra-cuu.html`: compose the profile component and the four tab panels.

## Verification

- Build the site successfully.
- Verify the compiled lookup page has the default history panel visible and all three empty panels hidden until selected.
- Inspect the output at desktop and mobile widths for the two-column/one-column transitions and table scrolling.
