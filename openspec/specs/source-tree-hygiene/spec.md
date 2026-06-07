# source-tree-hygiene Specification

## Purpose
Defines repository hygiene rules so generated build outputs and temporary faculty workspaces do not pollute the source tree or Git state.

## Requirements
### Requirement: Build outputs khong nam trong source tree
Generated build outputs SHALL not be committed under `src/` or other source-tree locations. `.gitignore` SHALL cover the known accidental output paths.

Required ignore patterns:
- `src/**/dist/`
- `src/dist/`
- `.tmp/`
- `dist/`
- `dist_*/`

#### Scenario: Build output sai cho bi gitignore bo qua
- **WHEN** a developer runs a build with a wrong cwd or output directory and files are written to `src/dist/`
- **THEN** those files are ignored by Git and are not accidentally committed

#### Scenario: Source tree khong chua thu muc dist
- **WHEN** `git ls-files` is checked for tracked `src/**/dist/` paths
- **THEN** no tracked files exist under those source-tree dist paths

### Requirement: Faculty workspace temp folder isolated
Faculty build workspaces under `.tmp/faculty-build/{id}/` SHALL live at repo root, not under `src/`, and SHALL be gitignored.

#### Scenario: Workspace tmp o root
- **WHEN** the build pipeline prepares a faculty workspace
- **THEN** files are created under `.tmp/faculty-build/{id}/` and not under `src/.tmp/` or similar locations

#### Scenario: Workspace tmp khong bi tracked
- **WHEN** `git status` is checked after a build
- **THEN** `.tmp/` does not appear as an untracked or modified path due to generated workspace content
