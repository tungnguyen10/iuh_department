## ADDED Requirements

### Requirement: Shared Agent Instruction Bridge
The repository SHALL expose `.agents` as the canonical shared instruction surface and SHALL provide stable grouped access from `.codex` and `.github` without duplicating instruction files or symlinking entire top-level trees.

#### Scenario: Discover canonical shared skills
- **WHEN** an agent or developer lists `.agents/skills`
- **THEN** each shared skill SHALL exist there as the canonical directory entry

#### Scenario: Discover canonical shared prompts
- **WHEN** an agent or developer lists `.agents/prompts`
- **THEN** each shared prompt SHALL exist there as the canonical file entry

#### Scenario: Codex resolves shared skills from `.agents`
- **WHEN** an agent or developer lists `.codex/skills`
- **THEN** each shared skill entry SHALL be a symlink to the corresponding directory in `.agents/skills`

#### Scenario: GitHub resolves shared skills from `.agents`
- **WHEN** an agent or developer lists `.github/skills`
- **THEN** each shared skill entry SHALL be a symlink to the corresponding directory in `.agents/skills`

#### Scenario: GitHub resolves shared prompts from `.agents`
- **WHEN** an agent or developer lists `.github/prompts`
- **THEN** each shared prompt entry SHALL be a symlink to the corresponding file in `.agents/prompts`

#### Scenario: Bridge compatibility views remain discoverable
- **WHEN** an agent or developer lists `.agents/codex/skills`, `.agents/github/skills`, or `.agents/github/prompts`
- **THEN** those grouped paths SHALL resolve to the same canonical entries under `.agents/skills` or `.agents/prompts`

### Requirement: Preserve Source Instruction Directories
The repository MUST keep `.codex` and `.github` readable at their original paths even though `.agents` is the canonical shared source.

#### Scenario: Consumer directories remain available
- **WHEN** `.agents` is present
- **THEN** `.codex/skills`, `.github/skills`, and `.github/prompts` SHALL remain readable at their original paths

### Requirement: Bridge Integrity Verification
The repository SHALL support a simple synchronization and verification flow so new canonical entries under `.agents` can be projected back to `.codex` and `.github`.

#### Scenario: New canonical skill is projected to both consumers
- **WHEN** a developer adds a new shared skill under `.agents/skills` and runs the documented sync command
- **THEN** matching symlink entries SHALL exist under both `.codex/skills` and `.github/skills`

#### Scenario: New canonical prompt is projected to GitHub surfaces
- **WHEN** a developer adds a new shared prompt under `.agents/prompts` and runs the documented sync command
- **THEN** matching symlink entries SHALL exist under `.github/prompts` and `.agents/github/prompts`

#### Scenario: Symlink targets exist
- **WHEN** a developer runs a file listing over `.codex`, `.github`, and `.agents`
- **THEN** every generated skill symlink SHALL resolve to an existing directory and every generated prompt symlink SHALL resolve to an existing file in the repository
