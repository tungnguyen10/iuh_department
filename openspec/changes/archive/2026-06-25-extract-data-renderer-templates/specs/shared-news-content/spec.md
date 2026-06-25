## ADDED Requirements

### Requirement: News Renderer Templates Live in Scanned Source

The shared news rendering pipeline SHALL define its HTML template producers (cards, sections, sidebar entries, detail article) in files that fall inside Tailwind's `content` scan paths under `src/`, so every Tailwind class used in the rendered output is emitted by the JIT compiler.

#### Scenario: Arbitrary-value classes are emitted
- **WHEN** a Dormitory Management or Health Science build runs and the news sidebar card markup uses arbitrary-value Tailwind classes (e.g. `w-[70px]`, `h-[70px]`, `md:w-[85px]`, `md:h-[85px]`, `h-[130px]`, `md:h-[150px]`)
- **THEN** the compiled CSS bundle SHALL contain the corresponding rules for every such class actually used by the rendered news markup

#### Scenario: Build config is not on Tailwind's content path
- **WHEN** Tailwind's `content` configuration is inspected
- **THEN** it SHALL NOT include `vite.config.js` or any other file outside `src/` purely to scan rendered template classes

#### Scenario: Renderer modules are colocated with the news feature
- **WHEN** a developer opens the shared news component folder under `src/shared/components/news/`
- **THEN** they SHALL find the JavaScript module that produces the news card, sidebar, section, and detail HTML alongside the news shell components

### Requirement: News Renderer Factory Is Pure At Module Scope

The news renderer module SHALL expose a factory function that the build pipeline calls with already-loaded data and base path, and SHALL NOT perform filesystem reads at module evaluation time.

#### Scenario: Module import has no side effects
- **WHEN** the news renderer module is imported
- **THEN** it SHALL NOT read JSON data, touch the filesystem, or rely on Node-only globals at module top-level

#### Scenario: Build pipeline supplies data
- **WHEN** the Vite plugin invokes the news renderer factory
- **THEN** it SHALL pass the selected faculty's news items and section metadata as arguments, and the factory SHALL return an HTML transform function
