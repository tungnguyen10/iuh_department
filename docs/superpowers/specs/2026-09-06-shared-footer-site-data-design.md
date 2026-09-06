# Shared Footer Site Data Design

## Goal

Keep the current `<!-- Footer Component -->` layout while rendering faculty-specific footer content from each faculty's `data/site.json` file. No faculty identity or footer navigation content may remain hard-coded in the shared template.

## Scope

The shared footer will render these existing site-data fields:

- `identity.unitName` and `identity.organizationName`
- `identity.address`, `identity.phone`, and `identity.email`
- `identity.mapAddress`
- every title and link in `footer.columns`
- every item in `footer.socialLinks`
- the faculty-aware copyright label

The footer logo will use the faculty-aware home URL. The visit count, online count, Google Maps embed, branch list, section labels, and developer credit remain shared presentation content because the current schema does not define faculty-specific values for them.

## Architecture and Data Flow

`src/shared/components/footer/department.html` remains the single shared footer layout. Dynamic regions use the existing `data-site-*` marker contract. During the include/build pipeline, `createSiteChromeRenderer` replaces each marker with escaped HTML generated from the selected faculty's validated `site.json` data and applies the faculty base path to internal links.

No faculty-specific footer template or client-side data request will be introduced.

## Validation and Error Handling

The existing site-data validator remains responsible for requiring non-empty identity fields, footer columns, links, social icons, and valid internal routes. The renderer continues to fail when any `data-site-*` marker or placeholder remains unresolved.

## Testing

Tests will first prove that the expanded footer template exposes every required marker and no longer contains the currently hard-coded identity/navigation content. Renderer tests will verify that faculty-specific identity, map address, footer columns, social links, copyright, home URLs, HTML escaping, and base-path rewriting all appear in the final HTML with no unresolved markers.

The complete test suite and production build will run after implementation.
