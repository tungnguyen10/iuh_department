# activities renderer

This folder hosts the shared activities renderer factory (`activities-renderer.js`)
used by the Vite build plugin to inject card / list / sidebar / detail markup into
pages that expose `data-activities-*` markers.

The activities HTML shells (page partials consumed via `data-include`) still live
under the faculty folder, e.g. `src/faculties/dormitory-management/components/activities/`.
Only the JS that produces card/sidebar/detail markup at build time is shared here,
so Tailwind's `content` glob picks up every class used in the rendered output.
