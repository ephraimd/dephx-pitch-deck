# dephx-pitch-deck

Make exceptional pitch decks with your AI agent. Ask for an investor deck, a customer pitch,
a partner proposal or a demo-day five-slider, and the agent works like a partner-grade deck
builder who also reads your product:

1. **One audience, one decision.** Investors, customers and partners get different decks
   built on a shared core, each slide answering the question the last one raised.
2. **Every claim traced.** Features, prices and numbers are checked against the real
   product. What is live, early and future is said in words. Unknown numbers stay visible
   placeholders, never guesses.
3. **Your brand, not a template.** The agent reads your colour roles, fonts, logo and design
   rules before choosing anything.
4. **Animated product scenes** that show a flow (order, deliver, get paid) and still make
   sense as a picture, because each one opens on its finished state.
5. **Checked before you send.** Overflow, overlapping text, small type, contrast, leftover
   placeholders and the traps that break imports.
6. **Survives the trip.** PDF to email, a PPTX that imports into PowerPoint, Keynote and
   Google Slides with the animations kept as GIFs, and an HTML deck to present live.
7. **One round of sharp questions** after a first version is on screen, not a questionnaire
   before it.

Works in **Claude Code**, **Codex** and **Pi**. The skill loads only when you ask for a deck,
so it costs nothing in other sessions.

## Install

**Claude Code**

```
/plugin marketplace add ephraimd/dephx-pitch-deck
/plugin install dephx-pitch-deck@dephx-pitch-deck
```

**Codex**

```sh
codex plugin marketplace add ephraimd/dephx-pitch-deck
codex plugin add dephx-pitch-deck@dephx-pitch-deck
```

No plugin support in your Codex? Clone this repo and run `./install.sh --codex` (all projects)
or `./install.sh --codex --here` (this project). It adds a short pointer to `AGENTS.md`, not
the whole skill, and rewrites only its own block on re-run.

**Pi**

```sh
pi install git:github.com/ephraimd/dephx-pitch-deck
```

`./install.sh` prints all of these.

## Use it

Ask in plain words:

> Build a seed investor deck for this product.

> Make a customer pitch for small agencies that glorifies the features they will adopt first.

> Our deck broke when imported into Google Slides. Fix it.

The agent reads your product and brand, builds a first version with every unknown number
as a placeholder, then asks one round of questions. For a deck people will download or
import, it uses the toolkit:

```sh
node <plugin-root>/scripts/new-deck.mjs ./my-deck --title "Company Seed Deck"
cd my-deck && npm install && npx playwright install chromium
npm run build    # dist/deck.html: arrows to move, N notes, F full screen, G grid
npm run qa       # add -- --final before sending: fails on any placeholder left
npm run render   # out/slides/*.png, out/deck.pdf, out/scenes/*.gif, out/contact-sheet.png
npm run pptx     # out/deck.pptx with GIF scenes and speaker notes
```

Turn one logo into export-safe transparent PNGs (colour, light, dark):

```sh
python3 <plugin-root>/tools/logo-variants.py logo.png my-deck/assets/
```

## Requirements

- Node 18 or newer. The toolkit uses Playwright (Chromium) and pptxgenjs from npm.
- `ffmpeg` on PATH for animated GIFs (`npm run render -- --no-gif` skips them).
- Python 3 with Pillow, only for `logo-variants.py`.

## What's inside

| Path | What it is |
| --- | --- |
| `skills/pitch-deck/SKILL.md` | The method: the bar a deck must clear and the nine-step workflow |
| `skills/pitch-deck/references/` | Audiences and outlines, claims and evidence, slide craft, animated scenes, export, questions, pitfalls |
| `template/` | The deck toolkit: theme tokens, layout components, a fictional example deck, a scene runtime |
| `template/scripts/` | `build`, `qa`, `render` (PNG, PDF, GIF, contact sheet), `pptx` |
| `scripts/new-deck.mjs` | Scaffolds a deck project, never writing into a folder with files |
| `tools/logo-variants.py` | Transparent colour, light and dark logo PNGs from one file |
| `install.sh` | Prints install commands; writes the Codex `AGENTS.md` fallback |

## About the PPTX

The toolkit's PPTX is **exact**: each slide is a full-resolution picture, each animated scene
an animated GIF in the same place, and the speaker notes are kept. Text is not editable in
PowerPoint or Google Slides; edit the slide files and export again. The skill explains when
an editable rebuild is worth it and how to avoid the usual breakages.

## Developing

```sh
npm test                    # fast checks
bash test/smoke.sh --full   # also scaffolds, installs and runs qa, render and pptx
npm run sync                # after changing package.json: regenerates .claude-plugin/*.json
```

`package.json` is the one source for name, version and description; the Claude Code and Codex
manifests are generated from it and the tests fail if they drift.

## Author

Created by **Adedamola Daniel**
([github.com/ephraimd](https://github.com/ephraimd), adedamolaniel@gmail.com).

The method grew out of building real investor and customer decks with an AI agent, and every
pitfall in it was hit at least once on the way.

## License

MIT, Adedamola Daniel. Playwright, pptxgenjs and other dependencies keep their own licences.
