// Shared helpers for build, qa, render and pptx.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const W = 1920;
export const H = 1080;

export function loadDeck() {
  const deck = JSON.parse(readFileSync(join(root, "deck.json"), "utf8"));
  const dir = join(root, "slides");
  const files = readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));
  const order = deck.order || files;
  const missing = order.filter((id) => !files.includes(id));
  const unlisted = files.filter((id) => !order.includes(id));
  const slides = order
    .filter((id) => files.includes(id))
    .map((id) => {
      const html = readFileSync(join(dir, `${id}.html`), "utf8").trim();
      const notes = (html.match(/<aside class="notes">([\s\S]*?)<\/aside>/) || [])[1] || "";
      return { id, html, notes: notes.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() };
    });
  return { ...deck, slides, missing, unlisted };
}

export function deckUrl(query = "") {
  const file = join(root, "dist", "deck.html");
  if (!existsSync(file)) throw new Error("dist/deck.html missing: run npm run build first");
  return pathToFileURL(file).href + query;
}

// Loads Playwright lazily so build works without it installed.
export async function launch() {
  const { chromium } = await import("playwright");
  return chromium.launch();
}

// Waits for web fonts and scene iframes. The page's load event already waits for iframes
// (including the ?still reload, which starts before load), so a short pause covers paint.
export async function settle(page) {
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

export function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
