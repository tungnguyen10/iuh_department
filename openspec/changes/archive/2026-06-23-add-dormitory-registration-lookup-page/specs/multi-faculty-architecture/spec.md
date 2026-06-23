## ADDED Requirements

### Requirement: Chromeless layout mode
The shared layout SHALL provide a chromeless mode so authenticated or focused pages can suppress public site chrome while still benefiting from shared head, body wrapper, and runtime wiring.

#### Scenario: Chrome flag defaults to on
- **WHEN** a page declares the layout marker without `chrome` (or with `chrome="on"`)
- **THEN** the wrapped layout SHALL render the public site header, footer, search modal, and scroll-to-top widget as it does today

#### Scenario: Chrome flag off suppresses public chrome
- **WHEN** a page declares `<!-- LAYOUT: chrome="off" -->`
- **THEN** the wrapped layout SHALL NOT render the public site header include, the public site footer include, the search modal include, or the scroll-to-top widget
- **AND** the wrapped layout SHALL still render the shared `<head>` (title, meta tags, favicons, theme color), the loading overlay, the `<main>` content slot, the main script, and any page script slot

#### Scenario: Chromeless pages still receive shared runtime
- **WHEN** a chromeless page loads
- **THEN** the shared loading overlay and the shared main script SHALL initialise
- **AND** chrome-specific runtime modules (header behavior, footer behavior, search modal behavior, scroll-to-top behavior) SHALL be skipped because their selectors are absent
