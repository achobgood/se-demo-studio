# The interview

Goal: learn enough to fill every slot in BUILDER_PROMPT_TEMPLATE.md without guessing. Ask in rounds with
AskUserQuestion (up to four questions per round, a recommended option first, plain words, no jargon). Ask free-text
questions in chat when options would be artificial. Skip a question when an earlier answer already settles it.
Keep every answer in your notes as you go, quoting the person's own words where they gave them; they are written
to `jobs/<slug>/INTERVIEW.md` once the job exists (SKILL.md step 2).

Before round 1, ask in chat for one or two sentences on what they want, in their words. That sentence becomes
"The ask, in the owner's words". Do not paraphrase it.

Shortcut: when the conversation has already settled most answers, do not repeat them as rounds. Propose the story
in plain words, check it against the environment, then ask only what is still open, each question with a
recommended answer. Quote the person's words from the conversation in INTERVIEW.md and still read the summary back
for a yes.

## Round 1: what and who

1. **Product and demo environment.** Which Cisco product, and where it runs for the demo: a dCloud instant demo
   (ask for the demo name or link), a partner or Cisco lab, their own sandbox with fictional data, or a public
   site. Customer environments are not allowed: if the answer is a customer's tenant or production system, say
   so plainly and help them pick a demo environment instead. Also tell them, before the job is created, what
   leaves their Mac: Claude sees the product screens and page text, and OpenRouter models receive the script
   text, the narration audio, and review frames and stills of the recorded product.
   If it is their own environment (a sandbox or lab they built), create the job right away and do your
   reconnaissance in the job's Chrome (SKILL.md Steps 2 and 3), so they sign in once and the facts you check land
   in INTERVIEW.md.
2. **Kind and length.** A virtual SE walkthrough (default, about 5 minutes), a short customer ad (60 to 90
   seconds), or an internal explainer. Ask whether it may run longer if the story needs it, and the hard ceiling. The template is built for the walkthrough; for an ad, also read
   `examples/cloud-control-se-demo/README.md` notes on how the 90-second ad differed (hook, reveal, more motion
   graphics, announcer-style voice).
3. **Audience.** Customers (which roles), partners, or internal SEs. What they should understand after watching,
   and what they should do next.
4. **Persona.** Default: an unnamed Cisco SE speaking to a generic customer, with a disclosure that the voice is
   AI-generated. Alternatives: a named clearly fictional SE, or a scenario built around one fictional customer.

## Round 2: story and scope

5. **Story.** Do they already have an incident, workflow, or use case in mind? If yes, get the specifics (site,
   user, alert, what should happen). If no, the builder picks the strongest story the demo data supports, and they
   approve it at the storyboard checkpoint.
6. **Must show / must avoid.** Features that must appear, listed per product area, with a length ceiling for the
   whole video, and anything to keep out (unreleased features, a competitor, a product that is not connected in
   the demo). Ask whether anything may be added after the final. Settle the whole list now: each addition after
   the final costs a new storyboard, a new sign-in, and new renders (L67).
7. **How far the demo may act.** "Look and ask" (navigate, search, ask the AI questions: safest), or "full
   control" (also run investigations, assign or resolve items, run demo workflows). Tenant administration is
   never allowed by default. If the story's strongest moment needs a configuration change, ask for that exact
   change by name (which setting, from what value to what value), when it is reset (default: after every take),
   and confirm it is logged. Allow nothing broader than what they name.
8. **Customer questions.** Which two or three questions a customer would ask during this demo ("Does this
   replace my controllers?", "Can the AI change my network on its own?", "What does this cost?"). Offer to pick
   them from the research.

## Round 3: guardrails

9. **Redaction.** Blur names, emails, and tenant identifiers (default), or none because the data is fictional
   and the video is internal. Also ask what else lives in the same environment: content belonging to other
   customers or projects, and test objects, stays off screen entirely (filter lists before they are visible, open
   records by direct link, avoid list pages). Their own identifiers count too, for example their phone number when
   it shows as a caller. Treat this answer as a starting scope: the storyboard lists the exact identifiers that will
   be visible, and they confirm the blur list against that (scope often narrows once they see it).
10. **Branding and distribution.** Internal draft (default), or intended for customers. Remind them that nothing
    here is brand, legal, or SME reviewed, and that customer-facing use is their decision after review.
11. **Voice.** Default "a calm, assured, technical demo voice, not a marketing voice". Any preference on gender,
    accent, or pace. Product names that are often mispronounced.
12. **Budget and time.** OpenRouter spend cap for the job (default $15; the 5-minute Cloud Control demo spent
    $2.66) and the time limit (default 4 hours). When they need it by.

## Round 4: sources (only if not obvious)

13. **Claim authority.** Official pages the claims must come from. Default: the researcher agent finds official
    Cisco docs, data sheets, and blog posts and quotes them verbatim. Ask if they have field guidance, a battle
    card, or positioning notes to include (these set positioning; they cannot authorize a technical claim the
    official sources do not support).

## Round 5: live environment (ask only what applies)

Ask this round right after round 2 when the environment is their own or the story needs something to happen live.

14. **Surfaces and identities.** Every app, console, or window the story uses; which identity signs in to each
    (check whether one covers all); which apps allow only one session at a time (sign out elsewhere first); and
    which open in a new tab.
15. **Live actions by the owner.** Recommend none unless the live event is the point of the story; a record the
    system already holds (a past call, an existing ticket) usually tells it as well and runs unattended (L2). On a
    person's first job (`jobs/` holds only test runs), recommend none at all, and present live actions and the AI
    caller as advanced: they need the person for an hour or more during the build (L81). Say
    plainly what live actions cost: they must be available within set time windows, they rehearse once with the
    builder, and they are asked "ready?" before every live take, so a cue never arrives while they are away. If
    they still want them: anything they must do in the real world during a take (place a call, send a message, tap
    a device), with the exact steps and when to do each, and what the demo must do in reply (answer, open,
    accept). The waiting is cut from the video; the screen shows something useful while it happens. The rehearsal
    comes first, so the reply is tested on the real event before they are cued for a recorded take.
    When the live action is a phone call into a product that works by conversation (for example a Contact Center
    AI Agent with no keypad menu), offer the AI caller instead (references/AI_CALLER.md): ChatGPT voice mode
    places and holds the call with no human on the line. Say that OpenAI then hears the whole call, and that it
    needs a one-time setup of about 10 minutes (audio cables, Claude in Chrome, Webex audio settings, a test call
    to their own phone). Before they choose it, ask the four readiness questions at the top of AI_CALLER.md
    "Setup" (Webex Calling that can dial outside numbers, a ChatGPT voice button, permission to install a driver,
    and the number to dial). If any answer is no, drop the AI caller now, not after the story is built.
16. **Time windows.** Schedules that limit when live takes can run (business hours, maintenance windows, a demo
    reservation ending), with the time zone. Everything else can run any time.
17. **Off-screen events.** Anything the screen recording cannot capture (phone audio, another device, an email
    inbox). Default: show the product's own log, trace, or history of the event instead.

## After the interview

Read the answers back in five to eight plain bullets, including the job name you will use (a short
lowercase slug such as `cloud-control-webex`), and ask for a yes before creating the job. The exception is the
person's own environment, where round 1 already created the job so they sign in once; then ask for the yes before
writing the builder prompt.

In `jobs/<slug>/INTERVIEW.md`, add "Verified facts" (what you confirmed in the environment, with where you saw it)
and "Still unverified" (what the builder's exploration must check before the storyboard).
