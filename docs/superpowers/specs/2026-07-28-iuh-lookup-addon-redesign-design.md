# IUH Lookup Addon Redesign

## Goal

Redesign the student-information addon on the dormitory lookup page to match the approved Option B reference: a dark, centered identity card that flows from student identity to academic data and ends with a prominent accommodation footer.

## Scope

- Change only the `iuh-lookup-addon` markup and styles on `tra-cuu.html`.
- Preserve the displayed values, existing lookup tabs, profile panel, and registration-state behaviour.
- Keep the addon as a responsive sidebar on large screens and a full-width block on smaller screens.

## Visual direction

- Palette: `#20211F` canvas, `#2B2C2A` card, `#F7F7F5` primary text, `#A4A39E` muted labels, `#EA3D91` avatar, `#073D75` accommodation footer, and `#2E86E7` status badge. The addon must use this reference palette rather than existing IUH colors.
- Identity: a 112px magenta rounded-square initials avatar sits above the centered name and a compact, dark MSSV chip. The existing eyebrow and repeated “Sinh viên” row are removed.
- Academic metadata: Khoa, Lớp, Giới tính, and Năm nhập học render as a plain two-column list with only hairline dividers; individual field boxes are removed.
- Accommodation: Phòng/Giường and status are moved into one cobalt footer bar. The room value is the visual anchor; the status is a blue pill with a dot indicator.
- Typography: retain the project’s Inter/sans stack. Labels use muted gray utility text; values use white medium-to-bold text.

## Responsive and accessibility requirements

- Do not truncate long faculty names or student names; allow natural wrapping.
- Keep labels and values in separate columns at practical widths; on narrow screens, allow the room footer to stack while preserving a clearly centered identity block.
- Preserve semantic `aside`, `article`, `header`, heading, and paragraph content.
- Use color only as an enhancement: borders, contrast, and font weight must keep highlighted rows readable.

## Validation

- Build with `yarn build`.
- Inspect the generated lookup page at desktop and narrow viewport widths to ensure the addon retains its spacing, wrapping, and hierarchy.
