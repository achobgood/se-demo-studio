# Claim rules for Cisco product demos

These add to the claim rules in the builder prompt. The researcher agent writes product-specific rules into
`research/PRODUCT_UNDERSTANDING.md` ("Must not claim"); this file holds the rules that apply to every Cisco
product.

## Sources

- The claim authority is official Cisco material: cisco.com product pages, data sheets, configuration and user
  guides, release notes, ordering guides, and blogs.cisco.com. Quote verbatim with the URL and the fetch date.
- Fetch cisco.com with `scripts/fetch-cisco-source.sh <url>` (`--links` to find chapters in a book index,
  `--grep TERM` to find a line). WebFetch gets HTTP 403 on cisco.com, and agents told to verify against pages they
  cannot open have produced fluent quotes that did not exist. If several agents all say "the sources are
  unreadable", check with a different tool before believing it.
- Field guidance, battle cards, and positioning notes set positioning. They never authorize a technical claim
  that the official sources do not support.
- Keep internal or confidential material (for example Trust Portal documents marked Cisco Confidential) out of
  anything spoken or on screen.

## Wording

- Product names exactly as Cisco writes them, and keep similar products distinct (Cisco Cloud Control is not
  Cisco Security Cloud Control).
- Licensing and price: Cisco's exact wording with its qualifiers, never "free" and never "for every customer".
  For example Cloud Control is "included at no additional cost with eligible Cisco subscriptions".
- Availability: region, tier, and status (GA, preview, beta, controlled availability) as the source states
  them, in end-card fine print. Leave out anything not generally available, or keep its label visible on screen.
- AI features: "helps investigate", "helps find the cause", "suggests". Never "finds the root cause", "fixes it
  automatically", or "sees everything". People review and approve changes, within their permissions.
- Platforms that sit on top of product consoles do not replace them. Each product stays the authority for its
  own domain unless Cisco says otherwise.
- No metrics. Cisco figures in blogs are usually one customer's anecdote or a hypothetical ("a four-hour incident
  into a forty-minute one" is a hypothetical). Demo data counts are not claims.
- Next step: generally available wording, such as "Learn more at cisco.com" or "talk with your Cisco account
  team". Not "request access" unless the source says so.

## Branding

Not official Cisco marketing unless the owner has approval: no Cisco logo, bridge mark, or Cisco brand typeface
as a graphic element (the logo inside recorded product UI is fine). Say in the README that brand, legal, and SME
review have not happened.

## Learner-facing copy

No em dashes. No slogan stacks, no "not X but Y" lines, no stacked rhetorical questions, no meta-copy about what
the video is not. Say what the viewer will see and what it does.
