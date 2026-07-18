# Dormitory Management Form Demo Page

## Goal

Add `src/faculties/dormitory-management/pages/form.html` as the Dormitory Management counterpart of the existing Health Science form component demo.

## Scope

- Preserve the complete form-component and table-style coverage from `src/faculties/health-science/pages/form.html`.
- Update page metadata, breadcrumb text, hero copy, form heading, and support contact details for the Dormitory Management unit.
- Add one clearly separated “Thông tin nội trú” example section using existing shared form primitives.
- Keep the page as a frontend demonstration: submission remains client-side and no API or persistence is introduced.
- Do not change shared components, existing Dormitory pages, or faculty-wide styling.

## Page Structure

The new page follows the source page in this order:

1. Dormitory-specific metadata and breadcrumb.
2. Existing responsive form-library hero, with Dormitory Management wording.
3. Existing complete form demo.
4. A new Dormitory information section containing:
   - student ID;
   - dormitory building/area;
   - room number;
   - request category.
5. Existing submit/reset/draft controls and client-side demo behavior.
6. Existing three table-style demonstrations.

## Reuse and Styling

- Reuse `@shared/components/form/*`, shared buttons, breadcrumb, existing IUH utility classes, icons, and validation attributes.
- Retain the current responsive layout and visual language rather than introducing Dormitory-only CSS or duplicate components.
- New fields use unique IDs and names and integrate with the existing `FormData` demo submission.

## Validation and Error Handling

- Student ID is required and uses a numeric pattern suitable for an IUH student code example.
- Building/area and request category are required selects with placeholder options.
- Room number remains optional because some requests may be made before room assignment.
- Native browser validation and the existing demo submit handler remain the only validation/submission behavior.

## Verification

- Confirm the new page is discovered by the project build from the faculty `pages` directory.
- Run the repository's relevant formatter/linter/build checks.
- Compare structural coverage with the Health Science source and confirm the new Dormitory field group is rendered through shared components.
- Check that IDs referenced by the character counter and submit script remain unique and present.

