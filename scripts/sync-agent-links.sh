#!/usr/bin/env bash

set -euo pipefail
shopt -s nullglob

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/.." && pwd)"
cd "$repo_root"

mkdir -p \
  .agents/skills \
  .agents/prompts \
  .codex/skills \
  .github/skills \
  .github/prompts

# Only create instructions targets if the source exists.
if [[ -d .agents/instructions ]]; then
  mkdir -p .github/instructions
fi

reset_link_dir() {
  local dir=$1
  local entry

  for entry in "$dir"/*; do
    [[ -e "$entry" || -L "$entry" ]] || continue
    if [[ -L "$entry" ]]; then
      rm "$entry"
      continue
    fi

    echo "Refusing to overwrite non-symlink entry: $entry" >&2
    exit 1
  done
}

link_children() {
  local source_dir=$1
  local target_dir=$2
  local relative_prefix=$3
  local entry
  local name

  reset_link_dir "$target_dir"

  for entry in "$source_dir"/*; do
    [[ -e "$entry" || -L "$entry" ]] || continue
    name=$(basename "$entry")
    ln -s "${relative_prefix}/${name}" "${target_dir}/${name}"
  done
}

link_children ".agents/skills" ".codex/skills" "../../.agents/skills"
link_children ".agents/skills" ".github/skills" "../../.agents/skills"
link_children ".agents/prompts" ".github/prompts" "../../.agents/prompts"

if [[ -d .agents/instructions ]]; then
  link_children ".agents/instructions" ".github/instructions" "../../.agents/instructions"
fi
