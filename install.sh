#!/usr/bin/env bash
#
# dephx-pitch-deck installer.
#
# The skill loads on demand from its description, so no tool needs a hook or an always-on
# instruction block. Each tool gets the shape it supports:
#
#   Claude Code  native plugin (marketplace in this repo)
#   Codex        native plugin (reads the same marketplace); --codex writes a short
#                AGENTS.md pointer as a fallback for a Codex without plugin support
#   Pi           native package (package.json "pi.skills")
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="ephraimd/dephx-pitch-deck"
SKILL="$ROOT/skills/pitch-deck/SKILL.md"
BEGIN="<!-- BEGIN dephx-pitch-deck -->"
END="<!-- END dephx-pitch-deck -->"

say() { printf '  %s\n' "$*"; }

# A pointer, not the skill's text: AGENTS.md is read in every session, and a deck skill is
# needed in few of them.
render_block() {
  printf '%s\n' "$BEGIN"
  printf '## Pitch decks\n\n'
  printf 'When asked to make, review or export a pitch, investor, sales, customer or partner deck,\n'
  printf 'read `%s` first and follow it.\n' "$SKILL"
  printf '%s\n' "$END"
}

install_codex() {
  local target
  if [ "${1:-}" = "--here" ]; then target="./AGENTS.md"; else
    mkdir -p "$HOME/.codex"; target="$HOME/.codex/AGENTS.md"
  fi
  if [ -f "$target" ] && grep -q "$BEGIN" "$target"; then
    local tmp block; tmp="$(mktemp)"; block="$(mktemp)"
    render_block > "$block"
    awk -v b="$BEGIN" -v e="$END" -v f="$block" '
      $0 == b { while ((getline line < f) > 0) print line; skip = 1; next }
      $0 == e { skip = 0; next }
      !skip { print }
    ' "$target" > "$tmp"
    mv "$tmp" "$target"; rm -f "$block"
    say "updated $target (everything else in it preserved)"
  else
    [ -f "$target" ] && printf '\n' >> "$target"
    render_block >> "$target"
    say "wrote $target"
  fi
}

install_claude() {
  say 'in Claude Code:'
  say "    /plugin marketplace add $REPO"
  say '    /plugin install dephx-pitch-deck@dephx-pitch-deck'
  say "or from this clone: /plugin marketplace add $ROOT"
}

install_codex_plugin() {
  say "codex plugin marketplace add $REPO"
  say 'codex plugin add dephx-pitch-deck@dephx-pitch-deck'
  say 'no plugin support? run: ./install.sh --codex [--here]'
}

install_pi() {
  say "pi install git:github.com/$REPO"
  say "update later with: pi update git:github.com/$REPO"
}

case "${1:---all}" in
  --codex)   echo "Codex (AGENTS.md fallback):"; install_codex "${2:-}" ;;
  --claude)  echo "Claude Code:"; install_claude ;;
  --pi)      echo "Pi:"; install_pi ;;
  --all)
    echo "Claude Code:"; install_claude
    echo; echo "Codex:"; install_codex_plugin
    echo; echo "Pi:"; install_pi
    ;;
  *) echo "usage: install.sh [--all|--claude|--pi|--codex [--here]]" >&2; exit 1 ;;
esac
