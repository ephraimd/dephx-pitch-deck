// Builds out/deck.pptx from the render: each slide is its full-resolution picture, each
// animated scene an animated GIF in the same place, and the speaker notes are kept.
// Exact on import into PowerPoint, Keynote and Google Slides; text is not editable there.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PptxGenJS from "pptxgenjs";
import { root } from "./lib.mjs";

const out = join(root, "out");
const manifestFile = join(out, "manifest.json");
if (!existsSync(manifestFile)) throw new Error("out/manifest.json missing: run npm run render first");
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in = 1920 x 1080 at 144 px per inch
pptx.title = manifest.title;
const inch = (px) => px / 144;

let gifs = 0;
for (const s of manifest.slides) {
  const slide = pptx.addSlide();
  slide.addImage({ path: join(out, s.png), x: 0, y: 0, w: 13.333, h: 7.5 });
  for (const sc of s.scenes) {
    if (!sc.gif || !existsSync(join(out, sc.gif))) continue;
    slide.addImage({ path: join(out, sc.gif), x: inch(sc.x), y: inch(sc.y), w: inch(sc.w), h: inch(sc.h) });
    gifs++;
  }
  if (s.notes) slide.addNotes(s.notes);
}

await pptx.writeFile({ fileName: join(out, "deck.pptx") });
console.log(`out/deck.pptx (${manifest.slides.length} slides, ${gifs} animated scenes)`);
