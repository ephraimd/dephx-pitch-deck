// package.json is the one source for name, version, description and author. This writes
// the Claude Code / Codex manifests from it, so a release bumps one file.
//   node scripts/sync-manifests.mjs          write .claude-plugin/*.json
//   node scripts/sync-manifests.mjs --check  exit 1 if they are out of date (used by tests)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const owner = pkg.author;

const plugin = {
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  author: owner,
  homepage: pkg.homepage,
  repository: pkg.homepage,
  license: pkg.license,
  keywords: pkg.keywords.filter((k) => !k.endsWith("-plugin") && k !== "pi-package"),
};

const marketplace = {
  name: pkg.name,
  description: pkg.description,
  owner,
  plugins: [{ name: pkg.name, source: "./", description: pkg.description, version: pkg.version }],
};

const targets = [
  [join(root, ".claude-plugin/plugin.json"), plugin],
  [join(root, ".claude-plugin/marketplace.json"), marketplace],
];

const check = process.argv.includes("--check");
let stale = 0;
for (const [file, data] of targets) {
  const next = JSON.stringify(data, null, 2) + "\n";
  let current = "";
  try {
    current = readFileSync(file, "utf8");
  } catch {}
  if (current === next) continue;
  if (check) {
    console.error(`out of date: ${file} (run: npm run sync)`);
    stale++;
  } else {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, next);
    console.log(`wrote ${file}`);
  }
}
// exitCode, not process.exit(): explicit exit intermittently segfaults on some Node builds.
process.exitCode = stale ? 1 : 0;
