## ADDED Requirements

### Requirement: Build-Time HTML Templates Live Under Scanned Source

Any HTML template literal evaluated by the Vite build plugin to produce page markup (news, activities, or future data-driven sections) SHALL be defined in a module under `src/` that is covered by Tailwind's `content` configuration, so all classes used in the rendered output are visible to the Tailwind JIT.

#### Scenario: New renderer placed inside src
- **WHEN** a new data-driven section is added to the build plugin
- **THEN** its template literals SHALL be defined in a module under `src/shared/components/` or `src/faculties/<faculty>/components/` rather than inline in `vite.config.js`

#### Scenario: Existing renderers do not inline templates in vite.config.js
- **WHEN** the build plugin renders the news or activities markers
- **THEN** the HTML producers (card, list card, sidebar card, detail, section, category list) SHALL be imported from modules under `src/`, and `vite.config.js` SHALL NOT define those template literals inline

### Requirement: Tailwind Content Globs Cover All Build-Time Templates

The Tailwind `content` configuration SHALL cover every source file that contributes class names to rendered output, without requiring build-config files such as `vite.config.js` to be added to the scan list.

#### Scenario: Tailwind config excludes build config
- **WHEN** `tailwind.config.js` is inspected
- **THEN** its `content` array SHALL list source directories under `src/` and SHALL NOT include `vite.config.js` or comparable build-tool files

#### Scenario: Arbitrary-value classes used by build-time templates are emitted
- **WHEN** the project is built with any selected faculty
- **THEN** every arbitrary-value Tailwind class referenced by the news or activities renderer output SHALL appear in the compiled CSS bundle
