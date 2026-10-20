// Renders the built deck:
//   out/slides/NN-id.png   every slide at 1920x1080, scenes in their finished state
//   out/deck.pdf           one page per slide, text selectable
//   out/scenes/*.gif       each animated scene as a seamless loop (needs ffmpeg)
//   out/contact-sheet.png  every slide on one image, to check rhythm at a glance
//   out/manifest.json      what pptx.mjs needs: slides, notes, scene positions
// npm run render -- --no-gif  skips GIFs
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { deckUrl, hasFfmpeg, launch, loadDeck, root, settle } from "./lib.mjs";

const deck = loadDeck();
const out = join(root, "out");
const skipGif = process.argv.includes("--no-gif");
for (const d of ["slides", "scenes", "frames"]) rmSync(join(out, d), { recursive: true, force: true });
mkdirSync(join(out, "slides"), { recursive: true });

const manifest = { title: deck.title, slides: [] };
const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Slides and scene positions.
  for (let n = 1; n <= deck.slides.length; n++) {
    const s = deck.slides[n - 1];
    await page.goto(deckUrl(`?render=${n}`));
    await settle(page);
    const png = join(out, "slides", `${String(n).padStart(2, "0")}-${s.id}.png`);
    await page.screenshot({ path: png });
    const scenes = await page.evaluate(() => {
      const slide = document.querySelector(".slide.is-current");
      const bg = getComputedStyle(slide).backgroundColor;
      return Array.from(slide.querySelectorAll("iframe.scene")).map((f) => {
        const r = f.getBoundingClientRect();
        return {
          src: f.getAttribute("src").replace(/[?&]still$/, ""),
          x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
          bg: f.dataset.bg || bg,
        };
      });
    });
    manifest.slides.push({ id: s.id, png: relative(out, png), notes: s.notes, scenes });
    console.log(`slide ${n} ${s.id}`);
  }

  // PDF.
  await page.goto(deckUrl("?print"));
  await settle(page);
  await page.pdf({ path: join(out, "deck.pdf"), width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
  console.log("out/deck.pdf");

  // Contact sheet.
  // Written to a file next to the PNGs: a setContent page cannot load file:// images.
  const thumbs = manifest.slides
    .map((s, i) => `<figure><img src="${s.png}"><figcaption>${i + 1} ${s.id}</figcaption></figure>`)
    .join("");
  const cols = 4;
  const rows = Math.ceil(manifest.slides.length / cols);
  const sheetFile = join(out, "contact-sheet.html");
  writeFileSync(sheetFile, `<!doctype html><style>body{margin:0;padding:16px;background:#222;display:grid;grid-template-columns:repeat(${cols},480px);gap:16px;font:16px system-ui;color:#ccc}
    figure{margin:0}img{width:480px;height:270px;display:block}figcaption{padding-top:4px}</style>${thumbs}`);
  const sheet = await browser.newPage({ viewport: { width: cols * 480 + (cols + 1) * 16, height: rows * 300 + (rows + 1) * 16 } });
  await sheet.goto(pathToFileURL(sheetFile).href);
  await sheet.waitForLoadState("load");
  await sheet.screenshot({ path: join(out, "contact-sheet.png"), fullPage: true });
  await sheet.close();
  console.log("out/contact-sheet.png");

  // Scene GIFs.
  // The same objects as in the manifest, so the GIF paths reach pptx.mjs.
  const allScenes = manifest.slides.flatMap((s) => s.scenes.map((sc, k) => Object.assign(sc, { name: `${s.id}-${k + 1}` })));
  if (allScenes.length && !skipGif && !hasFfmpeg()) console.warn("ffmpeg not found: skipping GIFs (install it, or pass --no-gif)");
  else if (allScenes.length && !skipGif) {
    mkdirSync(join(out, "scenes"), { recursive: true });
    for (const sc of allScenes) {
      sc.gif = join("scenes", `${sc.name}.gif`);
      await recordGif(browser, sc, join(out, sc.gif));
      console.log(`out/${sc.gif}`);
    }
  }
} finally {
  await browser.close();
}
rmSync(join(out, "frames"), { recursive: true, force: true });
rmSync(join(out, "contact-sheet.html"), { force: true });
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));

// Records one clean loop in real time, on the slide's own background, and encodes a GIF.
async function recordGif(browser, sc, file) {
  const dir = join(out, "frames", String(Date.now()));
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: sc.w, height: sc.h } });
  try {
    await page.goto(pathToFileURL(join(root, "dist", sc.src)).href);
    // Scene timers count from navigation, so measure from there, not from goto returning.
    const t0 = Date.now() - (await page.evaluate(() => performance.now()));
    await page.addStyleTag({ content: `html,body{background:${sc.bg} !important}` });
    const win = await page.evaluate(() => window.__scene);
    if (!win) throw new Error(`${sc.src} did not publish window.__scene (use scene.js)`);
    const frames = [];
    for (let i = 0; ; i++) {
      const t = (Date.now() - t0) / 1000;
      if (t > win.loopEnd + 0.15) break;
      const buf = await page.screenshot();
      if (t >= win.loopStart - 0.05) {
        const name = `f${String(frames.length).padStart(5, "0")}.png`;
        writeFileSync(join(dir, name), buf);
        frames.push({ name, t });
      }
    }
    const list = [];
    for (let i = 0; i < frames.length && frames[i].t < win.loopEnd; i++) {
      const next = Math.min(frames[i + 1] ? frames[i + 1].t : win.loopEnd, win.loopEnd);
      list.push(`file '${frames[i].name}'`, `duration ${Math.max(0.02, next - frames[i].t).toFixed(3)}`);
    }
    writeFileSync(join(dir, "list.txt"), list.join("\n") + "\n");
    const pal = "split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle";
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
      "-filter_complex", `fps=15,${pal}`, "-loop", "0", file]);
  } finally {
    await page.close();
  }
}
