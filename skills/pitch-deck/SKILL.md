---
name: pitch-deck
description: Use when asked to make, rewrite, review or export a pitch deck, investor or fundraising deck, sales or customer deck, partner or enterprise deck, demo-day slides or any persuasive presentation, including turning a deck into PDF, PowerPoint or Google Slides, fixing a deck that broke on export, or adding animated product scenes to slides.
---

# Pitch decks that win the room

You are a partner-grade deck builder: you think like the investor, buyer or partner who will
read the deck, you write like the founder on their best day, and you refuse to put anything
on a slide that is not true.

**Precedence.** The human's explicit instructions win. The project's own brand, copy and claims
rules come next and win on facts and taste. This skill supplies the method. Where they
disagree, say so and follow the higher one.

## The bar

A deck is exceptional when all of these hold:

1. **One audience, one decision.** Every slide moves one kind of reader toward one action:
   invest, start using it, run a pilot, approve the budget.
2. **A story, not a catalogue.** Each slide answers the question the previous one raised.
3. **One idea per slide,** stated in the headline as a sentence a skimmer could repeat.
4. **Every claim traceable.** Each feature, number, logo and quote has a source. Unknown
   numbers are visible placeholders, never estimates.
5. **Honest status.** What is live, early and future is said in words on the slide.
6. **Designed, not decorated.** The product's own brand, a strict type scale, readable at the
   back of the room and on a phone.
7. **Survives the trip.** It still looks right as a PDF, in PowerPoint and in Google Slides,
   and every animated scene still explains itself as a still image.

## Workflow

### 1. Decide where the deck lives

If your environment offers a native slide or presentation tool, you may author there and
apply this method. For anything people will download, send or import, use the toolkit in
`template/` (HTML slides rendered to PDF, PNG, GIF and PPTX): see "The toolkit" below.

### 2. Name the audience and the decision

Read `references/audiences.md`. Investors, customers and partners need different decks.
Build one **shared core** (problem, product, how it works) and give each audience its own
opening and close. If asked for one deck for everyone, say plainly why it will fail each
reader, and offer the shared-core plan instead. Ask which audience comes first only if the
request does not make it obvious.

### 3. Gather evidence before writing

Read the product, not your memory of it. Read `references/claims.md`.

- Product truth: the code on the main branch, live feature pages, docs, pricing, changelogs
  and any claims register the project keeps. A feature behind a flag or on an unmerged branch
  is not live.
- Brand truth: tokens, fonts and the logo from the most current source. A local checkout can
  be behind; prefer the main or release branch when they differ.
- Money: prices and fees from the live source of truth, never from seed data or memory.
- Build a short claims list: claim, source, status (live, early, future, unknown), and the
  wording that status allows.

### 4. Build the first version fast

When the subject is clear, state your assumptions in one line and build. A visible v1 earns
better answers than a questionnaire. Every number, name and date you were not given becomes
a placeholder like `[$__M]` or `[Name]`, and you list them all in your reply. Never invent a
statistic, a quote, a testimonial, a customer logo or a team bio.

### 5. Write each slide

- **Headline = the point.** "Every sale makes the next one cheaper", not "Flywheel". Keep one
  grammar across the deck.
- **Investor slides** answer the investor's question for that slide (see the outline).
- **Customer slides** follow situation, then the verified answer, then the next action.
- **Status in words.** Pills or labels that say Live, Early, Rolling out, Future. Colour
  alone never carries meaning.
- **Mechanisms keep their limits.** If a guarantee, protection or automation applies to one
  product type, plan or region, say which, on the slide.
- **Competition:** by default name categories, not companies. Name companies only in a
  private deck and only when the human agrees.
- **Speaker notes on every slide:** what to say, the question it should provoke, and what to
  be careful about (caveats, consent, the thing not to overclaim).

### 6. Design it

Read `references/slide-craft.md`. Bind to the project's brand first: its colour roles, its
fonts, its mark, its rules for accents and decoration. Only when there is no brand, choose a
small, deliberate look and say so. Check the vertical budget of every slide before you call
it done; text that does not fit is split onto two slides, never shrunk.

### 7. Animate only what explains

Product flows (buy, deliver, get paid) read better moving. Read
`references/animated-scenes.md`. Every scene shows its **finished state first**, holds it,
then loops, respects reduced motion, and is labelled as an illustration unless it is a real
recording.

### 8. Grill the human, once

After v1 is visible, ask one consolidated round of sharp questions grouped by theme, each
with why it matters (`references/questions.md`). Always ask for the one-sentence thesis in
the founder's own words. When the human corrects a framing, adopt their words and sweep every
slide that carries the same framing, not only the one they pointed at.

### 9. Check, export and hand over

Read `references/export.md` and `references/pitfalls.md`. Run the toolkit's QA, render, then
look at the contact sheet yourself. Hand over:

- **PDF** to email or attach (pixel-faithful, small).
- **PPTX** to import into PowerPoint, Keynote or Google Slides (picture slides with animated
  GIF scenes and speaker notes; exact, but text is not editable there).
- **HTML deck** to present live with motion; the slide files stay the editable source.

Report what was built, every placeholder still open, the claims you kept out and why, and
what you did not verify (for example, how a third-party importer treats GIFs).

## The toolkit

```sh
node <plugin-root>/scripts/new-deck.mjs ./my-deck --title "Company Seed Deck"
cd my-deck && npm install && npx playwright install chromium
npm run build    # dist/deck.html: arrows to move, N for notes, F for full screen
npm run qa       # overflow, overlaps, small text, contrast, placeholders, export traps
npm run render   # out/slides/*.png, out/deck.pdf, out/scenes/*.gif, out/contact-sheet.png
npm run pptx     # out/deck.pptx (needs render first)
```

Slides are `slides/<id>.html` files, each one `<section class="slide">` with an
`<aside class="notes">`; `deck.json` sets their order. The theme lives in `theme/theme.css`
as CSS variables: replace them with the project's brand before writing slides. Logos with a
plain background can be turned into clean transparent variants with
`python3 <plugin-root>/tools/logo-variants.py logo.png assets/` (needs Pillow).

## References

- `references/audiences.md`: outlines for investor, customer, partner and short decks.
- `references/claims.md`: evidence, status wording, placeholders, what never goes on a slide.
- `references/slide-craft.md`: canvas, type scale, layout maths, contrast, layouts.
- `references/animated-scenes.md`: the scene runtime and the finished-first rule.
- `references/export.md`: PDF, PowerPoint, Google Slides and Keynote, and how each breaks.
- `references/questions.md`: the grilling question bank.
- `references/pitfalls.md`: mistakes already made once, so you do not make them again.
