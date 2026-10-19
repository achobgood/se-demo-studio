# Demo studio

This folder is a studio for recording narrated virtual SE product demos from a live, signed-in product.

- When someone asks to record, make, or build a demo (for example "help me record a demo"), to come up with a
  demo idea or scenario for a video, or to continue a job in `jobs/`, use the `record-demo` skill. It interviews
  them, sets up the job, launches the builder, and stops for their approval at the storyboard.
- Start sessions from this folder: the studio's agents in `.claude/agents` only register here.
- Run on Opus 5.5 at high effort (`claude-opus-5-5`, set in `.claude/settings.json`). If the session is on
  another model or effort, ask the person to run `/model claude-opus-5-5` and `/effort high` before continuing.
  Subagents and NodeTerm sessions use the same exact model id, never the `opus` alias.
- Never read `.env`, never ask for or print the OpenRouter key, and never type or store passwords, codes,
  cookies, or tokens for the person. Never record or screenshot a sign-in page.
- Demo environments with fictional data only (dCloud, a lab, or the person's own sandbox). Never a customer's
  tenant or production system: its screens would go to Anthropic and to OpenRouter models.
- Work for a job stays in `jobs/<slug>/`. Do not modify `toolkit/`, `examples/`, or `.claude/` during a job;
  improvements to the studio itself are a separate task the person asks for.
- Learner- and customer-facing copy: no em dashes, no slogan stacks, plain and specific.
