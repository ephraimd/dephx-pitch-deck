// Checks each slide in the real browser for the problems that ruin decks.
//   npm run qa             errors fail; placeholders are warnings
//   npm run qa -- --final  placeholders fail too (run before sending)
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deckUrl, launch, loadDeck, root, settle } from "./lib.mjs";

const final = process.argv.includes("--final");
const deck = loadDeck();
const errors = [];
const warns = [];

// Source checks that need no browser.
for (const s of deck.slides) {
  if (!s.notes) warns.push(`${s.id}: no speaker notes`);
  for (const m of s.html.matchAll(/src="([^"]+)"/g)) {
    const src = m[1];
    if (/^https?:/.test(src)) errors.push(`${s.id}: remote image ${src} (copy it into assets/)`);
    else if (/\.webp(\?|$)/i.test(src)) errors.push(`${s.id}: WebP image ${src} (some importers drop WebP; use PNG or JPG)`);
    else if (!existsSync(join(root, src.split("?")[0]))) errors.push(`${s.id}: missing file ${src}`);
  }
  if (/<img[^>]*style="[^"]*filter:/i.test(s.html)) warns.push(`${s.id}: CSS filter on an image (dropped by native exports; pre-render the variant)`);
  for (const m of s.html.matchAll(/<iframe class="scene" src="([^"?]+)/g)) {
    const file = join(root, m[1]);
    if (existsSync(file) && !/Scene\.(steps|css|timeline)\(/.test(readFileSync(file, "utf8"))) {
      errors.push(`${s.id}: scene ${m[1]} does not use scene.js (it must show its finished state first)`);
    }
  }
}
if (deck.missing.length) errors.push(`deck.json lists slides with no file: ${deck.missing.join(", ")}`);

const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (let n = 1; n <= deck.slides.length; n++) {
    const id = deck.slides[n - 1].id;
    await page.goto(deckUrl(`?render=${n}`));
    await settle(page);
    const found = await page.evaluate(() => {
      const out = { errors: [], warns: [], placeholders: [] };
      const slide = document.querySelector(".slide.is-current");
      // A footer band reserves the bottom 160px; without one, the 128px margin applies.
      const footerTop = slide.querySelector(".footer") ? 920 : 952;
      const label = (el) => {
        const t = (el.textContent || "").trim().replace(/\s+/g, " ");
        return `<${el.tagName.toLowerCase()}> "${t.slice(0, 40)}${t.length > 40 ? "..." : ""}"`;
      };
      const isText = (el) => Array.from(el.childNodes).some((c) => c.nodeType === 3 && c.textContent.trim());
      const visible = (el) => {
        const cs = getComputedStyle(el);
        return cs.display !== "none" && cs.visibility !== "hidden" && !el.closest(".notes");
      };

      if (slide.scrollHeight > 1080 + 1 || slide.scrollWidth > 1920 + 1) out.errors.push("content larger than the slide");

      const texts = Array.from(slide.querySelectorAll("*")).filter((el) => visible(el) && isText(el));
      for (const el of texts) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        if (size < 24) out.errors.push(`text under 24px (${size}px): ${label(el)}`);
        const inFooter = el.closest(".footer");
        if (!inFooter && el.closest("[data-qa-ignore]") === null) {
          if (r.bottom > footerTop + 1) out.errors.push(`below the content area (bottom ${Math.round(r.bottom)}px > ${footerTop}px): ${label(el)}`);
          if (r.left < 127 || r.right > 1793) out.errors.push(`outside the side margins: ${label(el)}`);
        }
        if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== "visible") out.errors.push(`text clipped: ${label(el)}`);
      }

      // Overlapping text blocks (not nested in each other).
      const blocks = Array.from(slide.querySelectorAll("h1,h2,h3,p,li,td,th")).filter(visible);
      for (let a = 0; a < blocks.length; a++) {
        for (let b = a + 1; b < blocks.length; b++) {
          const A = blocks[a], B = blocks[b];
          if (A.contains(B) || B.contains(A)) continue;
          const ra = A.getBoundingClientRect(), rb = B.getBoundingClientRect();
          const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (x > 4 && y > 4) out.errors.push(`overlapping text: ${label(A)} and ${label(B)}`);
        }
      }

      // Display headlines with explicit line breaks must not re-wrap, and need spare width,
      // because importers measure fonts differently and push text into the next block.
      for (const el of slide.querySelectorAll("h1,h2")) {
        if (!el.querySelector("br")) continue;
        const range = document.createRange();
        range.selectNodeContents(el);
        const tops = new Set();
        let right = 0;
        for (const rect of range.getClientRects()) {
          if (!rect.width) continue;
          tops.add(Math.round(rect.top));
          right = Math.max(right, rect.right);
        }
        const widest = right - el.getBoundingClientRect().left;
        const wanted = el.querySelectorAll("br").length + 1;
        if (tops.size > wanted) out.errors.push(`headline wraps into ${tops.size} lines, written as ${wanted}: ${label(el)}`);
        else if (widest > el.clientWidth * 0.9) out.warns.push(`headline has under 10% spare width, may re-wrap on import: ${label(el)}`);
      }

      // Contrast against the nearest solid background.
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const bgOf = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.backgroundImage !== "none" && n !== el) return null;
          const v = parse(cs.backgroundColor);
          if (v.length >= 3 && (v.length < 4 || v[3] >= 0.99)) return v;
        }
        return [255, 255, 255];
      };
      for (const el of texts) {
        const cs = getComputedStyle(el);
        const fg = parse(cs.color);
        const bg = bgOf(el);
        if (!bg || fg.length < 3 || (fg.length === 4 && fg[3] < 0.99)) continue;
        const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
        const ratio = (l1 + 0.05) / (l2 + 0.05);
        const large = parseFloat(cs.fontSize) >= 44;
        if (ratio < (large ? 3 : 4.5)) out.errors.push(`contrast ${ratio.toFixed(1)}:1 is too low: ${label(el)}`);
      }

      const text = slide.cloneNode(true);
      text.querySelectorAll(".notes").forEach((n) => n.remove());
      for (const m of text.textContent.matchAll(/\[[^\]\n]{0,60}\]/g)) out.placeholders.push(m[0]);
      return out;
    });
    found.errors.forEach((e) => errors.push(`${id}: ${e}`));
    found.warns.forEach((w) => warns.push(`${id}: ${w}`));
    if (found.placeholders.length) {
      const msg = `${id}: placeholders ${[...new Set(found.placeholders)].join(" ")}`;
      (final ? errors : warns).push(msg);
    }
  }
} finally {
  await browser.close();
}

for (const w of warns) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${deck.slides.length} slides, ${errors.length} errors, ${warns.length} warnings${final ? " (final)" : ""}`);
process.exitCode = errors.length ? 1 : 0;
