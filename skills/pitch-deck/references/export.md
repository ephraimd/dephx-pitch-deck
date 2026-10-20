# Export: PDF, PowerPoint, Google Slides, Keynote

Decide the delivery format with the human by use:

| Use | Send | Why |
| --- | --- | --- |
| Email, attach, data room | PDF | Exact on every device, small, text selectable |
| Present from someone else's laptop | PDF, or the PPTX | No fonts or network needed |
| Import into Google Slides, PowerPoint or Keynote | The toolkit's PPTX | Exact, keeps GIF motion and speaker notes |
| Present live with motion | The HTML deck | Scenes play live |
| Someone must edit the text | The slide source files, or rebuild natively | See the trade-off below |

## The trade-off nobody mentions

A PPTX can be **exact** (each slide a picture, motion as GIFs, text not editable) or
**editable** (real text boxes, re-flowed by the importer's fonts and rules). The toolkit
makes the exact one, because a pitch that looks broken costs more than one that needs a
re-export to edit. If an editable file is required, plan for a cleanup pass in the target
tool and apply every fix below.

## How native exports break, and the fix

| Symptom | Cause | Fix |
| --- | --- | --- |
| Logo missing or a warning icon | WebP images are not supported by some importers (Google Slides) | Use PNG or JPG for every image |
| Logo shows as a white or black square | CSS filters (invert, brightness) are dropped | Pre-render the recoloured variant as its own PNG |
| Headline runs into the paragraph below | The importer's font wraps lines later; text boxes keep their measured height | Explicit line breaks, 10 to 15 percent spare width, bigger gaps under display text |
| Wrong typeface | Fonts not installed on the viewing machine | Install the fonts, choose basic fonts on export, or use picture slides |
| Animation frozen or blank | Live HTML is flattened to one frame | Scenes show their finished state first; use GIFs for motion |
| Gradients or textures banded or missing | Unsupported fills | Keep decoration to the cover and close, or render them as images |
| Tables re-flowed | Cell padding and widths differ | Shorter cell text, fewer columns, or a picture slide |

## Google Slides

Upload the PPTX to Google Drive and open it with Google Slides, or use File, Import slides.
Check after import: GIFs, speaker notes, and that each slide image is sharp. Very large
GIFs import slowly; keep each under about 2 MB.

## PowerPoint and Keynote

Both open the PPTX directly. GIFs animate in slideshow mode. Speaker notes appear in the
presenter view.

## Before sending

- `npm run qa -- --final`: no placeholders left, no overflow, contrast passes.
- Open the PDF and flip through every page at full screen.
- Look at `out/contact-sheet.png` for rhythm: headings in the same place, alternating tones.
- If the deck is private, say who it is for in the file name or cover, not in a hidden note.
