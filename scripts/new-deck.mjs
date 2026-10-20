#!/usr/bin/env node
// Scaffolds a deck project from the template, never writing into a folder that has files.
//   node scripts/new-deck.mjs ./my-deck [--title "Company Seed Deck"]
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const titleAt = args.indexOf("--title");
const title = titleAt >= 0 ? args[titleAt + 1] : null;

if (!target) {
  console.error('usage: new-deck.mjs <folder> [--title "Deck title"]');
  process.exitCode = 1;
} else {
  const dest = resolve(target);
  if (existsSync(dest) && readdirSync(dest).length) {
    console.error(`refusing: ${dest} is not empty`);
    process.exitCode = 1;
  } else {
    const template = join(dirname(fileURLToPath(import.meta.url)), "..", "template");
    const skip = new Set(["node_modules", "dist", "out"]);
    mkdirSync(dest, { recursive: true });
    cpSync(template, dest, { recursive: true, filter: (src) => !skip.has(basename(src)) });

    const pkgFile = join(dest, "package.json");
    const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
    pkg.name = basename(dest).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "pitch-deck";
    writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
    if (title) {
      const deckFile = join(dest, "deck.json");
      const deck = JSON.parse(readFileSync(deckFile, "utf8"));
      deck.title = title;
      writeFileSync(deckFile, JSON.stringify(deck, null, 2) + "\n");
    }

    console.log(`created ${dest}
next:
  cd ${target}
  npm install && npx playwright install chromium
  edit theme/theme.css with the product's brand, then replace slides/ (the example is fictional)
  npm run qa      checks every slide
  npm run render  PNGs, PDF, scene GIFs, contact sheet
  npm run pptx    deck.pptx for PowerPoint, Keynote and Google Slides`);
  }
}
