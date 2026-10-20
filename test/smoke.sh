#!/usr/bin/env bash
# Smoke test. Fast checks always; --full also scaffolds a deck, installs it and runs qa,
# render and pptx end to end (downloads Chromium once).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "ok   $*"; }

# Every skill has frontmatter with a name matching its folder and a description.
for f in skills/*/SKILL.md; do
  dir="$(basename "$(dirname "$f")")"
  head -1 "$f" | grep -qx -- '---' || fail "$f has no frontmatter"
  grep -q "^name: $dir$" "$f" || fail "$f name does not match folder $dir"
  grep -q '^description: .\{40,\}' "$f" || fail "$f description missing or too short"
done
pass "skill frontmatter"

# Every reference the skill names exists, and every reference file is named by the skill.
for ref in $(grep -o 'references/[a-z-]*\.md' skills/pitch-deck/SKILL.md | sort -u); do
  [ -f "skills/pitch-deck/$ref" ] || fail "missing $ref"
done
for f in skills/pitch-deck/references/*.md; do
  grep -q "references/$(basename "$f")" skills/pitch-deck/SKILL.md || fail "$f is never mentioned in SKILL.md"
done
pass "skill references resolve"

node scripts/sync-manifests.mjs --check || fail "manifests out of sync with package.json"
pass "manifests in sync"

node -e '
const p = require("./package.json");
if (!p.pi || !p.pi.skills || !p.pi.skills.includes("./skills")) process.exitCode = 1;
if (!p.author || p.author.name !== "Adedamola Daniel") process.exitCode = 1;
' || fail "package.json pi.skills or author missing"
pass "package manifest"

# Repo style: no em or en dashes in anything we ship. Node, not grep -P: BSD grep has no -P,
# and an erroring grep would read as a pass.
node -e '
const fs = require("fs"), path = require("path");
const skip = new Set(["node_modules", "out", "dist", ".git"]);
const hits = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|mjs|js|json|sh|html|css|svg|py)$/.test(e.name) || e.name === "LICENSE") {
      fs.readFileSync(p, "utf8").split("\n").forEach((l, i) => { if (/[\u2013\u2014]/.test(l)) hits.push(`${p}:${i + 1}`); });
    }
  }
})(".");
if (hits.length) { console.error(hits.join("\n")); process.exitCode = 1; }
' || fail "em or en dash found"
pass "no em/en dashes"

# Shipped content stays product-agnostic: no project names from the decks this grew out of.
node -e '
const fs = require("fs"), path = require("path");
const banned = /\b(trankets|yconsoft|flutterwave)\b/i;
const hits = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", "out", "dist", ".git", "test"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|mjs|js|json|sh|html|css|py)$/.test(e.name)) {
      fs.readFileSync(p, "utf8").split("\n").forEach((l, i) => { if (banned.test(l)) hits.push(`${p}:${i + 1}`); });
    }
  }
})(".");
if (hits.length) { console.error(hits.join("\n")); process.exitCode = 1; }
' || fail "project-specific name found"
pass "product-agnostic"

# Every example scene uses the runtime (finished state first).
for f in template/scenes/*.html; do
  grep -qE 'Scene\.(steps|css|timeline)\(' "$f" || fail "$f does not use scene.js"
done
pass "scenes use the runtime"

# Codex fallback: writes a pointer block, rewrites only its block, keeps other content.
tmp="$(mktemp -d)"
(
  cd "$tmp"
  printf '# My rules\nkeep me\n' > AGENTS.md
  bash "$ROOT/install.sh" --codex --here >/dev/null
  bash "$ROOT/install.sh" --codex --here >/dev/null
  grep -q 'keep me' AGENTS.md || exit 1
  [ "$(grep -c 'BEGIN dephx-pitch-deck' AGENTS.md)" = 1 ] || exit 1
  grep -q 'skills/pitch-deck/SKILL.md' AGENTS.md || exit 1
) || fail "codex AGENTS.md fallback"
rm -rf "$tmp"
pass "codex fallback block is idempotent and preserves the file"

# Scaffolder refuses a non-empty folder cleanly (exit 1 with the message, not a crash).
tmp="$(mktemp -d)"
touch "$tmp/existing"
set +e; out="$(node scripts/new-deck.mjs "$tmp" 2>&1)"; code=$?; set -e
[ "$code" = 1 ] && grep -q "not empty" <<<"$out" || fail "scaffold did not refuse a non-empty folder cleanly (exit $code)"
[ "$(ls "$tmp")" = existing ] || fail "scaffold wrote into a non-empty folder"
rm -rf "$tmp"
tmp="$(mktemp -d)/deck"
node scripts/new-deck.mjs "$tmp" --title "Smoke Deck" >/dev/null
[ -f "$tmp/slides/cover.html" ] && [ -f "$tmp/scripts/qa.mjs" ] && [ -f "$tmp/scenes/scene.js" ] || fail "scaffold incomplete"
grep -q '"Smoke Deck"' "$tmp/deck.json" || fail "scaffold did not set the title"
[ ! -e "$tmp/node_modules" ] && [ ! -e "$tmp/out" ] && [ ! -e "$tmp/dist" ] || fail "scaffold copied build output"
(cd "$tmp" && node scripts/build.mjs >/dev/null) || fail "build"
[ -f "$tmp/dist/deck.html" ] && [ -f "$tmp/dist/scenes/scene.js" ] || fail "build output incomplete"
pass "scaffold and build"

if [ "${1:-}" = "--full" ]; then
  (
    cd "$tmp"
    npm install --no-audit --no-fund --loglevel=error >/dev/null
    npx playwright install chromium >/dev/null
    # Each step must exit 0 on its own within the limit: a script that hangs is a failure.
    perl -e 'alarm 300; exec @ARGV' node scripts/qa.mjs >/dev/null || exit 1
    # --final must fail while the example's placeholders remain.
    set +e; perl -e 'alarm 300; exec @ARGV' node scripts/qa.mjs --final >/dev/null; code=$?; set -e
    [ "$code" = 1 ] || exit 1
    perl -e 'alarm 300; exec @ARGV' node scripts/render.mjs >/dev/null || exit 1
    perl -e 'alarm 120; exec @ARGV' node scripts/pptx.mjs >/dev/null || exit 1
    [ "$(ls out/slides/*.png | wc -l | tr -d ' ')" = 6 ] || exit 1
    [ -s out/deck.pdf ] && [ -s out/contact-sheet.png ] && [ -s out/deck.pptx ] || exit 1
    if command -v ffmpeg >/dev/null; then
      [ -s out/scenes/feature-1.gif ] || exit 1
      unzip -l out/deck.pptx | grep -q '\.gif' || exit 1
    fi
    [ "$(unzip -l out/deck.pptx | grep -c 'notesSlide[0-9]*\.xml$')" = 6 ] || exit 1
  ) || fail "full run: qa, render or pptx"
  pass "full: qa passes, --final fails on placeholders, render and pptx complete"
fi
rm -rf "$(dirname "$tmp")"
echo "all checks passed"
