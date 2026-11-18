# Demo studio

This folder is a studio for recording narrated virtual SE product demos from a live, signed-in product.

- When someone asks to record, make, or build a demo (for example "help me record a demo"), to come up with a
  demo idea or scenario for a video, or to continue or redo a job in `jobs/`, use the `record-demo` skill. It interviews
  them, sets up the job, launches the builder, and stops for their approval at the storyboard.
- Start sessions from this folder: the studio's agents in `.claude/agents` only register here.
- Run on Opus 5.5 at high effort (`claude-opus-5-5`, set in `.claude/settings.json`). If the session is on
  another model or effort, ask the person to run `/model claude-opus-5-5` and `/effort high` before continuing.
  Subagents and NodeTerm sessions use the same exact model id, never the `opus` alias.
- Never read `.env`, never ask for or print the OpenRouter key, and never type or store passwords, codes,
  cookies, or tokens for the person. Never record or screenshot a sign-in page.
- Demo environments with fictional data only (dCloud, a lab, or the person's own sandbox). Never a customer's
  tenant or production system: its screens would go to Anthropic and to OpenRouter models.
- Work for a job stays in `jobs/<slug>/`. Do not modify `knowledge/`, `toolkit/`, `examples/`, or `.claude/`
  during a job; improvements to the studio itself are a separate task the person asks for.
- The person asking for a demo may sell the product rather than operate it. Learn the product yourself in the
  signed-in environment until you can drive it unaided, and write down what you learn (L101).
- Before planning any demo, run `scripts/find-notes.sh <product words>` and read what it lists. Re-check every
  fact live before you build on it (L90, L103).
- What earlier jobs learned about a product is in `knowledge/<product>/` (`PLATFORM_MAP.md`, `ASK_ROUTING.md`;
  `knowledge/README.md` explains both). When a job's copy (`jobs/<slug>/research/PLATFORM_MAP.md` and
  `ASK_ROUTING.md`) is newer than knowledge/, start from the newer one. At the end of a job, the builder writes
  merged, dated copies of both files into the job's `research/`; the owner copies them into knowledge/ at release.
- Send research to parallel subagents from the start: `demo-researcher` for documentation, and `demo-explorer`
  agents for the product, one area each, all given the same brief (the builder launches the explorers). At most
  two drive the browser at once (L102).
- Lessons from past jobs are in `.claude/skills/record-demo/references/LESSONS_LEARNED.md`. Read a lesson before
  you depart from a rule that cites it.
- Motion segments are used only where the environment cannot show a step or an abstract scene clearly helps, never
  as decoration. Their rules are in `.claude/skills/record-demo/references/MOTION.md`; read it only for such a job
  or when the owner gave a style reference, and start with its concept card: decide what the viewer should see happen before any motion rule (L104).
- Learner- and customer-facing copy: no em dashes, no slogan stacks, plain and specific.
