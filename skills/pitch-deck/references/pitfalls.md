# Pitfalls

Each of these happened on a real deck. Check for them on yours.

## Story and claims

- **One deck for every audience.** It fails all of them. Build a shared core with
  audience-specific openings and closes.
- **The problem slide resolves to the wrong thesis.** Framing the product as "less of the
  pain" when the founder's thesis is "more of the upside" sends the whole deck off course.
  Ask for the thesis sentence; sweep every slide that repeats the framing when corrected.
- **A feature claimed as live that is behind a flag** or only on a branch.
- **A narrow mechanism described as universal:** a payment protection for one product type,
  payouts for one country, one automatic email described as "automation".
- **Contacts treated as subscribers.** Being in a list is not consent to marketing.
- **Fees from seed data or memory.** Live configuration differs. Point to the pricing page.
- **An illustration passed off as the product.** A polished "dashboard" image in the repo
  can be a generated picture with placeholder bars.
- **Invented numbers in mock-ups** that read as earnings or customer counts. Mask them.

## Brand and design

- **Brand read from a stale checkout.** The local branch was behind main; the tokens,
  button style and rules had changed. Read the current source.
- **An accent borrowed from one product line** used as the deck's highlight colour.
- **Decoration the brand forbids** (glows, gradient orbs) added because it looked nice.
- **Text sized to fit instead of split.** Shrinking text past 24px fails at the back of the
  room. Split the slide.
- **Status shown only by colour or a dashed border.** Say it in words.

## Export

- **WebP logo vanished** in Google Slides; **CSS-recoloured logo became a white square.**
  PNG files, pre-rendered variants.
- **Headline overlapped the paragraph** after import because the importer wrapped one more
  line. Explicit line breaks and spare width.
- **Animated scenes exported empty** because they started at step one with nothing typed
  yet. Finished state first, hold, then loop.
- **GIF loops timed by hand** drifted and jumped. Read the loop window from the runtime.
- **GIF on the wrong background** left a visible box on the slide. Record on the slide's own
  colour.

## Process

- **Questions before anything visible.** State assumptions, ship v1, then one round of
  questions.
- **A drip of questions.** One consolidated round, grouped, each with why it matters.
- **Placeholders left in a sent deck.** `npm run qa -- --final` before sending.
- **Claiming it renders without looking.** Open the PDF and the contact sheet yourself, and
  say what you did not check (for example, a third-party import).
- **Scripts that hang or crash on exit.** Close the browser in `finally`, set
  `process.exitCode` instead of calling `process.exit()`, and treat a script that does not
  exit on its own as a failure.
