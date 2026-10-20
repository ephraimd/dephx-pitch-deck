# Slide craft

## Bind to the brand first

Before choosing a single colour, find the project's design source of truth: CSS variables or
theme tokens, the font loading code, the logo component, and any written design rules. Note:

- The **colour roles**: background, surface, text, muted text, border, primary action, and
  their dark-mode values. Use roles, not a palette you like.
- **Accent rules.** Many brands reserve secondary colours for one product line or channel.
  Using such an accent as a general highlight quietly misbrands the deck.
- **Decoration rules.** If the brand forbids glows, gradients or shadows, so does the deck.
  If it has a signature texture or motif, reuse it sparingly (cover and close).
- **Fonts:** the display and body faces the product actually loads.
- **The mark:** find the transparent version the product uses and how it is recoloured on
  dark surfaces. Export tools drop CSS filters, so pre-render a light variant
  (`tools/logo-variants.py`).

No brand at all? Choose one dark, one light, one accent; two typefaces; say what you chose.

## Canvas and margins

- 1920 by 1080, 16:9. Margins 128px on every side, so the content box is 1664 by 824.
- Footer band: one 24px line pinned 64px from the bottom (page number, source, "Illustration"
  label). Give footered slides 160px bottom padding; nothing else goes below y 920.

## Type scale

Four or five sizes reused everywhere, for example 120 / 72 / 44 / 32 / 24.

- Nothing under 24px, including footers, table cells and labels.
- Display face for headlines, body face for everything else. Emphasise with weight or
  colour, not a new size.
- Display headlines that must stay on fixed lines get explicit line breaks, and each line
  has 10 to 15 percent spare width. Import tools re-wrap text with different font metrics,
  and a line that wraps late pushes into the paragraph below.

## Vertical budget (check every slide)

- Heading height is about size x lines x 1.1. A paragraph is size x lines x line-height.
- Characters per line: about box width / (0.6 x font size) for body text, more for bold or
  caps. Size boxes to their longest word.
- A table row is about 2.1 x font size per line of text.
- Add gaps and paddings. If the total passes 824px (792px with a footer), split the slide.
  Never shrink text to fit.

## Colour and contrast

- Body text at least 4.5:1 against its background; 3:1 at 44px and above.
- Two background tones across the deck (light and dark) plus one accent statement slide.
- Colour never carries meaning alone: a status pill says "Live", a winning cell says
  "Yes", a risk says "High risk". Things that must be told apart differ in lightness too.

## Layout patterns

| Pattern | Use for |
| --- | --- |
| Statement | Purpose, insight, the ask. One sentence, large, lots of space. |
| Cards (3 or 4 across) | Parallel items: segments, jobs, revenue streams. Same markup each. |
| Check list + visual | A feature: 3 or 4 points left, mock-up or scene right. |
| Big numbers | Traction, market. Number on top, a short label under it. |
| Flow with arrows | A loop or a process: 3 to 5 steps. |
| Table | Competition, plans. Words in cells ("Yes", "Partial"), never only icons. |
| Now / Next / Long run | Roadmap with honest status. |
| Two columns | Comparison, or text beside a product screen. |

Rhythm: slides of one kind share markup and keep the heading in the same place, so nothing
jumps as you click through.

## Mock-ups

Build interface mock-ups from the product's real tokens and real labels, at legible sizes
(24px minimum on the slide). Keep them simple: one task, three to five elements. Label them
as illustrations. Replace them with real screens when the human can supply them.
