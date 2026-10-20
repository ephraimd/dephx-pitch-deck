// Assembles deck.json + slides/*.html + theme into dist/deck.html.
//   Present:  open dist/deck.html (arrows or space to move, N notes, F full screen, G grid)
//   Render:   dist/deck.html?render=3  one slide at 1:1 with scenes held still (used by qa/render)
//   Print:    dist/deck.html?print     every slide stacked, one per PDF page
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadDeck, root } from "./lib.mjs";

const deck = loadDeck();
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const dir of ["theme", "assets", "scenes"]) {
  if (existsSync(join(root, dir))) cpSync(join(root, dir), join(dist, dir), { recursive: true });
}

const slides = deck.slides.map((s) => s.html).join("\n");
const fonts = (deck.fonts || []).map((href) => `<link rel="stylesheet" href="${href}">`).join("\n");
const title = deck.title.replace(/</g, "&lt;");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${fonts}
<link rel="stylesheet" href="theme/theme.css">
<style>
  html, body { margin: 0; background: #0b0b0c; overflow: hidden; }
  #stage { position: absolute; left: 50%; top: 50%; width: 1920px; height: 1080px; transform-origin: 0 0; }
  #stage .slide { display: none; }
  #stage .slide.is-current { display: flex; }
  #stage .slide.split.is-current { display: grid; }
  #notes { position: fixed; left: 0; right: 0; bottom: 0; max-height: 35vh; overflow: auto; display: none;
    background: rgba(12, 12, 14, .94); color: #eee; font: 18px/1.5 system-ui, sans-serif; padding: 16px 24px; }
  body.show-notes #notes { display: block; }
  #count { position: fixed; right: 16px; top: 12px; color: #888; font: 14px system-ui, sans-serif; }
  body.grid { overflow: auto; }
  body.grid #stage { position: static; transform: none !important; width: auto; height: auto; display: flex;
    flex-wrap: wrap; gap: 16px; padding: 16px; }
  body.grid #stage .slide { display: flex; position: relative; zoom: .2; cursor: pointer; }
  body.grid #stage .slide.split { display: grid; }
  /* render and print modes: 1:1, no chrome */
  html.mode-render, html.mode-render body, html.mode-print, html.mode-print body { background: transparent; overflow: visible; }
  html.mode-render #stage { left: 0; top: 0; transform: none !important; }
  html.mode-print #stage { position: static; transform: none !important; width: 1920px; height: auto; }
  html.mode-print #stage .slide { display: flex; position: relative; break-after: page; }
  html.mode-print #stage .slide.split { display: grid; }
  html.mode-render #count, html.mode-print #count, html.mode-render #notes, html.mode-print #notes { display: none !important; }
  @page { size: 1920px 1080px; margin: 0; }
</style>
</head>
<body>
<div id="stage">
${slides}
</div>
<div id="notes"></div>
<div id="count"></div>
<script>
(function () {
  var q = new URLSearchParams(location.search);
  var slides = Array.prototype.slice.call(document.querySelectorAll("#stage > .slide"));
  var renderAt = q.get("render");
  var print = q.has("print");
  var still = renderAt !== null || print;
  if (still) {
    document.documentElement.classList.add(print ? "mode-print" : "mode-render");
    // Scenes hold their finished state in stills and PDFs.
    document.querySelectorAll("iframe.scene").forEach(function (f) {
      var src = f.getAttribute("src");
      f.setAttribute("src", src + (src.indexOf("?") < 0 ? "?" : "&") + "still");
    });
  }
  var i = 0;
  function fit() {
    if (still || document.body.classList.contains("grid")) return;
    var s = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.getElementById("stage").style.transform = "scale(" + s + ") translate(-50%, -50%)";
  }
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle("is-current", k === i); });
    var notes = slides[i].querySelector(".notes");
    document.getElementById("notes").textContent = notes ? notes.textContent.trim() : "No notes for this slide.";
    document.getElementById("count").textContent = (i + 1) + " / " + slides.length;
    if (!still) history.replaceState(null, "", "#" + (i + 1));
  }
  if (print) return;
  addEventListener("resize", fit);
  addEventListener("keydown", function (e) {
    if (["ArrowRight", "PageDown", " ", "Enter"].indexOf(e.key) >= 0) show(i + 1);
    else if (["ArrowLeft", "PageUp", "Backspace"].indexOf(e.key) >= 0) show(i - 1);
    else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key === "n" || e.key === "N") document.body.classList.toggle("show-notes");
    else if (e.key === "f" || e.key === "F") (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
    else if (e.key === "g" || e.key === "G") { document.body.classList.toggle("grid"); fit(); }
  });
  slides.forEach(function (s, k) {
    s.addEventListener("click", function () {
      if (document.body.classList.contains("grid")) { document.body.classList.remove("grid"); show(k); fit(); }
    });
  });
  fit();
  show(renderAt !== null ? Number(renderAt) - 1 : (Number(location.hash.slice(1)) || 1) - 1);
})();
</script>
</body>
</html>
`;

writeFileSync(join(dist, "deck.html"), html);
console.log(`built dist/deck.html (${deck.slides.length} slides)`);
if (deck.missing.length) console.warn(`not in slides/: ${deck.missing.join(", ")}`);
if (deck.unlisted.length) console.warn(`in slides/ but not in deck.json order: ${deck.unlisted.join(", ")}`);
