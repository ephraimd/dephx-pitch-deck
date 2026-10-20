# Animated scenes

An animated scene is a small, self-contained HTML page shown inside a slide: a ticket being
scanned, an invoice moving from Draft to Paid, a message being written and scheduled. Use one
when the flow is easier to show than to tell. Two or three per customer deck is plenty; an
investor deck rarely needs more than the product slide.

## Rules

1. **Finished state first.** At load, the scene shows its most complete, most explanatory
   step and holds it (4 seconds by default), then starts the loop. PDFs, thumbnails and
   native exports capture a scene at load; a scene that starts empty exports as an empty
   box.
2. **One flow, 2 to 5 steps,** each step a visible change with a short caption.
3. **Seamless loop.** The last step leads back into the first without a jump.
4. **Reduced motion respected.** With `prefers-reduced-motion`, show the finished state and
   stop.
5. **Legible:** 24px minimum text at slide scale, the product's colours and labels.
6. **Labelled** as an illustration in the slide footer unless it is a real recording.
7. **Self-contained:** no network, system or bundled fonts, small (under 16 KB is a good
   target), transparent background so it sits on the slide.
8. **Nothing painted outside the frame's inset.** Shadows and glows that reach the iframe
   edge are cut off and leave a visible box; keep them inside the scene's padding.

## The runtime (`scenes/scene.js` in the template)

The runtime enforces rule 1 and publishes the loop window, so the GIF recorder knows exactly
which seconds form one clean loop. Never time a loop by hand.

```html
<script src="scene.js"></script>
<script>
  // Step-based: render(i) draws step i. Starts on the last step, holds, then cycles.
  Scene.steps({ count: 4, stepMs: 2800, render: (i) => show(i) });

  // Pure CSS animation with a fixed period (animations start at load).
  Scene.css({ periodMs: 10500 });

  // Free-form sequence: finish() draws the end state, play() runs one full pass that
  // takes durationMs (use setTimeout chains, not setInterval).
  Scene.timeline({ durationMs: 9600, finish, play });
</script>
```

Each call sets `window.__scene = { loopStart, loopEnd }` in seconds.

## Placing a scene on a slide

```html
<iframe class="scene" src="scenes/checkout.html" title="Checkout flow, illustration"
        style="left:1072px; top:150px; width:720px; height:760px"></iframe>
```

The iframe is positioned absolutely on the 1920 by 1080 slide. Add `data-bg="#0B1020"` when
the slide background is a gradient or image, so the GIF is recorded on the right colour.

## How scenes export

| Target | What happens |
| --- | --- |
| HTML deck | Plays live |
| PNG and PDF | The finished state, captured during the hold |
| PPTX from the toolkit | An animated GIF placed exactly over the scene's area |
| Google Slides (import of that PPTX) | GIFs generally keep playing; check after import |
| Other tools' native exports | Usually a still of whatever frame they captured |

GIF capture: real-time frames on the slide's background colour, trimmed to exactly one loop
from `__scene`, encoded with a generated palette at up to 15 fps. Keep each GIF under about
2 MB; simplify the scene if it grows past that.
