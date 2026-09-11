# Weekly calendar implementation

Goal: implement the user's explicit weekly timeline brief in the existing homepage calendar column.

Use a single faculty calendar HTML component for the homepage and a dedicated calendar.html destination for the full-calendar CTA. Use the existing button primitive (variant 9 controls, variant 12 CTA), local SVGs/currentColor, Inter/Roboto, Tailwind palette and 16px card radius. Preserve the documents column and existing homepage ordering.

Data: four events supplied by the user, dates 9–12 September 2026, initial seven-day range 8–14 September. Correct weekdays from the actual dates (Wednesday–Saturday). Event markup is the single source of data, matching the existing document-library DOM-record pattern. Real backend integration remains outside this UI task.

Controls: three visually tabbed filter buttons with aria-pressed, using the same pattern as the document library. Work schedule shows all four entries; deadlines only deadline entries; rooms only entries with physical meeting locations. Week navigation shifts seven calendar days while retaining the selected filter. Show explicit empty state for weeks/categories without entries. Date, title, time/location hierarchy; vertical line/dot colors by event kind and accessible text labels so color is not the only cue.

- [ ] Test filtering, chronological ordering, date formatting, week boundaries and invalid dates before implementing controller.
- [ ] Build shared calendar markup, controller, faculty runtime registration and full-calendar destination.
- [ ] Check production build, focused tests, all-suite regression delta, and browser filters/week navigation/mobile layout.
