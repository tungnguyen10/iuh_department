## ADDED Requirements

### Requirement: Dormitory News Uses Shared News Feature
The Dormitory Management module SHALL use the shared news feature with Dormitory-owned content.

#### Scenario: Dormitory home news uses shared rendering
- **WHEN** the Dormitory Management home page renders its news section
- **THEN** the section SHALL use shared news presentation code
- **AND** it SHALL render Dormitory-owned news content from selected faculty data

#### Scenario: Dormitory news detail exists
- **WHEN** a user opens a Dormitory Management news detail route
- **THEN** it SHALL render inside the shared layout using the shared news detail surface and Dormitory-owned article content

#### Scenario: Dormitory news links are not placeholders
- **WHEN** Dormitory Management news cards or search results are rendered
- **THEN** they SHALL link to Dormitory news routes rather than temporary `contact.html` or home-page placeholders
