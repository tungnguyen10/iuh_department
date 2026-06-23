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

### Requirement: Shared auth action bar
The platform SHALL provide a shared auth action bar component for use on authenticated or focused pages.

#### Scenario: Action bar renders configured items
- **WHEN** a page includes the auth action bar with one or more action items
- **THEN** the bar SHALL render each item as a link with the supplied label, href, and optional icon
- **AND** the bar SHALL apply an active-state class to the item that matches the current page route when one is provided

#### Scenario: Action bar is unobtrusive when chrome is off
- **WHEN** the auth action bar is rendered on a chromeless page
- **THEN** it SHALL appear at the top of the page content area and SHALL NOT replicate the public site header styling
