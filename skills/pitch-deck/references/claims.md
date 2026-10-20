# Claims and evidence

A deck is read as a promise. Anything on it that is not true becomes a broken promise in the
first call, the first trial or the first diligence request.

## Where truth comes from

Read sources in this order and record which one backs each claim:

1. Production behaviour you or the human can show.
2. Code on the main or release branch, including feature flags and configuration.
3. The project's own claims register, feature pages and docs (check they match the code).
4. The human's statements, recorded as theirs.

Code on an unmerged branch proves the feature exists there, not that customers have it. A
feature switched off by a flag is not live. Seed data and defaults are not live values:
configuration and plan data can differ from what the seed says.

## Status wording

| Status | Means | Wording on the slide |
| --- | --- | --- |
| Live | In production for the audience you address | Plain present tense, no label needed, or a "Live" pill |
| Early | Real but narrow (one trigger, one product type, beta) | "Early" pill, and name the narrow thing it does |
| Rolling out | Built, gated or partial | "Rolling out" with what remains |
| Future | Designed or intended | "Next" or "Long run", on a slide or column labelled as future |
| Unknown | You could not verify | Leave it out, and ask |

Say status in words. A dashed border or a lighter colour is a design cue, not the message.

## Placeholders

Every figure, name or date you were not given is a bracketed placeholder: `[$__M]`,
`[__ active users]`, `[Name]`, `[Month 2026]`. List them all when you hand over. The toolkit's
QA reports any left in the deck, and `npm run qa -- --final` fails on them.

## Never on a slide without evidence and permission

- Statistics, growth rates, customer counts, earnings or outcomes.
- Quotes and testimonials (need provenance and the person's permission).
- Customer or partner logos (need permission).
- Team credentials and past roles (the human supplies them).
- Comparisons with named competitors (and only in private decks, with the human's agreement).
- "Only", "first", "guaranteed", "instant", "unlimited", "secure" as absolutes.

## Mechanisms keep their conditions

If a protection, guarantee or automation applies only to one product type, plan, currency or
region, the slide says which. Typical traps:

- A payment protection that covers one checkout path described as covering all of them.
- A payout or currency claim broader than what the wallet actually supports.
- "Automatic" when the product does one narrow automatic thing (say exactly which).
- Treating every person in a contact list as someone who agreed to marketing. A buyer, a
  client, a contact and a subscriber who opted in are different records.
- A fee or price quoted from memory. Point to the live pricing page, and keep the platform's
  fee separate from the payment provider's charge.

## Illustrations and example data

- Prefer real product screens from a demo account with data you are allowed to show.
- A mock-up built for the deck is labelled ("Illustration", "Example page") in the footer.
- An image in the repo that looks like a screenshot may be an illustration with placeholder
  bars. Do not present it as the product.
- Example data is plainly fictional and follows the project's own guidance on examples.
- Money in mock-ups is masked (`$ ••••••`) rather than invented, so it never reads as an
  earnings claim.

## Speaker notes carry the caveats

Use notes for what the presenter must not overclaim, the condition behind a headline, the
data caveat behind a number, and the question the slide is meant to provoke.
