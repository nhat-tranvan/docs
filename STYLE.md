# CloudThinker Docs Style Guide & Content System

The rulebook for every page in this repo. Rewrite agents and human contributors follow it mechanically. Golden exemplars: `quickstart.mdx` (task/tutorial register), `guide/auto-mode.mdx` (concept), `guide/connections/coralogix.mdx` (connection), `guide/code-review/setup.mdx` (multi-procedure task page).

Source-of-truth hierarchy for facts: **app UI (screenshots in repo) → confirmed product facts (below) → CLAUDE.md canonical naming → app-adjacent reference pages → everything else.** Marketing copy is never a source of facts.

## Confirmed product facts (override any conflicting page text)

1. **Autonomy has exactly two modes: Manual / Auto.** Any 3-level (Suggest/Approve/Autonomous) or 4-level (notify→suggest→approve→autonomous) model is wrong — remove on sight. Use `/snippets/autonomy-modes.mdx`.
2. **Finding statuses: New / Acknowledged / Active / Resolved / Dismissed.** Use `/snippets/finding-statuses.mdx`. (Recommendation lifecycle is a separate object — never conflate.)
3. **Prompt syntax: `@agent #tool instruction`** — tool tag immediately after the mention, instruction after.
4. **Code-review bot mention: `@cloudthinker-ai`.** The skip-review token is unconfirmed — link to `/guide/code-review/mention-commands` instead of restating it.

## Terminology (canonical → banned)

| Canonical | Banned |
|---|---|
| Autonomous Cloud Operations / AgenticOps (category) | "Multi-Agent System (MAS) orchestration", "AI DevOps platform" |
| Modules: Code Review · Deep Response Engine · CostOps · SecOps · ChatOps · Skills | "Cost Optimization" as product name (lowercase activity is fine) |
| CloudKeepers (feature, first mention per page); **Keepers** in UI references; keeper (lowercase, one monitor) | "pilots", "CloudKeeper" |
| Manual / Auto (autonomy modes) | any 3- or 4-level autonomy model |
| `@agent #tool instruction` | `@agent [instruction] [#tool] [context]` |
| Tool tags: `#dashboard` `#report` `#recommend` `#alert` `#chart` `#kb` | inventing tags in examples |
| `@cloudthinker-ai` (bot) | `@cloudthinker` |
| Agents: Alex (Cloud Engineer), Oliver (Security Engineer), Tony (Database Engineer), Kai (Kubernetes Engineer), Anna (General Manager) | role-title drift |
| CloudThinker Language (the syntax; page `/guide/language`) | "Prompt" as a page title |
| Agentic loop: Detect → Analyze → Resolve → Validate — full explanation lives on `index.mdx` ONLY; elsewhere one sentence + link | re-explaining the loop |
| workspace, organization, connection, finding, recommendation, detection rule, run — lowercase mid-sentence | Capitalized Common Nouns |
| Name 3 example platforms + "and more" | "15+/10+/11+ platforms" counts |

## Style rules (enforceable)

1. **Headings**: frontmatter `title` in Title Case; all body headings in **sentence case**. Never `## **bold heading**`. Fixed section names: `Prerequisites`, `Setup`, `How it works`, `Troubleshooting`, `Next steps`, `Related`, `FAQ`, `You're done when…`.
2. **Voice**: second person, active, present tense. Steps imperative ("Click **Connect**"). Agents do things by name ("Alex queries CloudWatch"), never "the system will".
3. **Sentences** ≤25 words target, split at 35. Paragraphs ≤4 lines, one idea each.
4. **Intro**: ≤2 sentences before the first `##`. No "Introduction"/"Overview" headings inside a page.
5. **Components**:
   - `Steps` only for actions the reader performs (2–8). Product-internal flows use ordered lists or tables.
   - `Tabs` only for mutually exclusive paths (provider/auth/OS).
   - `Accordion` only for Troubleshooting, FAQ, optional deep detail. Primary content in an Accordion is a defect.
   - `Card` must have `href` — a Card without a link becomes bullets or a table.
   - `CardGroup` max 1 per page (the closing block); exceptions: `index.mdx` (3), module overviews (closing + none elsewhere).
   - `Frame`: every UI procedure keeps at least one screenshot; **never delete an image reference during a rewrite**.
   - Callouts max 1 per section, 4 per page (Troubleshooting excluded). `Warning` only for data-loss/lockout/cost risk.
6. **Code blocks**: prompts fenced ` ```text `, shell ` ```bash `, JSON ` ```json `. Prompt caps: 5 blocks per reference page, 4 per scenario, 2 per connection page, ≤3 prompts per block. Every prompt names a real agent + real tool tag + verifiable output.
7. **Frontmatter**: `title` unique site-wide; `description` verb-first, 50–150 chars, states what the reader accomplishes, never restates the title.
8. **Endings**: every guide page ends with exactly one CardGroup — `## Next steps` (sequential content) or `## Related` (reference/concept), `cols={2}`, 2–4 linked cards. Exempt: `learn/aio/*`, `api-reference/*`.
9. **Links**: root-relative (`/guide/...`); first mention of another feature is a link, later mentions plain text.
10. **Marketing**: allowed ONLY in `index.mdx` "Why CloudThinker" (≤120 words) and one ≤80-word "why" paragraph per module overview. Banned everywhere and always: competitor comparison tables, third-party statistics, unsourced percentages, "democratizing/revolutionizing/game-changing".

## Page templates (hard body-word budgets; split the page rather than exceed 1.5×)

**(a) Site landing** (`index.mdx`, 700w): intro (1 sentence, canonical category) → `## Start here` (CardGroup, 3 cards) → `## Choose your goal` (CardGroup 4–6) → `## How CloudThinker works` (THE agentic-loop home, ~120w + diagram) → `## The six modules` (CardGroup 6) → `## Why CloudThinker` (1 paragraph ≤120w).

**(b) Module overview** (400–800w): intro ≤2 sentences → optional ≤80w "why" paragraph → `## How it works` (3–5 stages, ordered list/table + 1 Frame — NOT Steps) → `## What you can do` (table: capability | description | link) → optional `## Key concepts` (table) → `## Get started` (CardGroup 2–4).

**(c) Task/how-to** (500–1200w): intro ≤2 sentences → `## Prerequisites` (bullets, link don't re-teach) → one `##` + `Steps` per procedure (imperative titles, bold UI paths **Settings → Connections**, Frame per UI step, "**Success state:**" line when the outcome isn't obvious) → Tabs for provider forks → optional `## Troubleshooting` (Accordions: cause/check/fix) → `## Next steps`.

**(d) Concept** (600–1200w, model = auto-mode.mdx): intro definition ≤2 sentences → `## Why <concept>` (≤5 bolded bullets) → `## Turn it on` (short Steps only if a toggle exists) → 2–4 behavior H2s (decision tables over prose) → optional `## Examples` (max 2, contrasting) → optional `## FAQ` (≤6) → `## Related`. One stated behavior per fact — never two descriptions of the same mechanism.

**(e) Reference** (≤1500w): intro ≤2 sentences → canonical form in ONE code block + component table → reference H2s as tables (every enumerable thing is a table row) → `## Examples` (≤5 blocks) → `## Related`.

**(f) Connection guide** (500–1000w): intro (what agents can do + auth model, 1–2 sentences) → `## Prerequisites` → `## Setup` (Steps ending "shows a **Connected** status") → `## Connection details` (field table) → `## Required permissions` (minimal scopes + least-privilege Tip) → `## Agent capabilities` (table) → `### Verify the connection` (ONE ```text block) → `### Example prompts` (ONE block, ≤3 prompts) → `## Troubleshooting` (≥3 Accordions) → `## Security` (import `/snippets/connection-security.mdx` + ≤2 vendor-specific bullets) → `## Related` (2 cards).

**(g) Tutorial** (600–1200w): intro (end state + "~10 minutes") → `<Info>` What you'll need → Steps (3–7, each with "**Success state:**") → `## You're done when…` (checklist) → optional Troubleshooting → `## Next steps` (first card = next in sequence).

**(h) Scenario/use case** (600–900w): intro (concrete outcome) → `## The scenario` (≤100w) → `## Walkthrough` (Steps alternating do/see, ≤4 prompt blocks) → `## What made this work` (3–5 bullets linking to features) → `## Try it yourself` (CardGroup).

## Snippets

| Snippet | Use in | Replaces |
|---|---|---|
| `/snippets/prompt-syntax-basics.mdx` | quickstart, agenticops, agents, slack/teams | duplicated syntax explainers |
| `/snippets/autonomy-modes.mdx` | cloudkeepers, autonomous-agents, agents | wrong 3/4-level models |
| `/snippets/finding-statuses.mdx` | cloudkeepers, recommendations | contradicting status sets |
| `/snippets/connection-security.mdx` | all connection pages | per-page security boilerplate |

Import syntax: `import Snippet from '/snippets/name.mdx';` then `<Snippet />`. Rule: identical wording needed in 3+ pages and context-free → snippet; otherwise canonical page + link. Canonical single homes: agentic loop → index; syntax reference → `/guide/language`; skill file example → `/guide/skills/skill-format`; recommendation lifecycle → `/guide/infrastructure/cloudkeepers`.

## Rewrite algorithm (per page)

1. Read old page + matching template + this file. Classify: reader *does* → task; reader *learns behavior* → concept; reader *looks up* → reference.
2. Preserve exactly: verified facts (UI paths, field names, scopes, defaults, limits), all image paths + alt text, valid internal links, frontmatter `icon`, the file slug.
3. Drop: competitor tables, "The Problem" sections, stats, href-less Cards, Accordion-hidden primary content (promote to H2), invented scenarios beyond caps, restatements of other pages (link instead), the losing side of any contradiction (per Confirmed facts; keep the screenshot-backed version).
4. Write top-to-bottom against the template; grep your draft for every banned term before finishing.
5. Frontmatter last: unique title, verb-first description.

## Verifier checklist (mechanical)

- Banned strings: `How Existing Tools Compare`, `Suggest / Approve / Autonomous`, `notify → suggest`, `pilots`, `4.4M`, `96%`, `## **`, `democratiz`, bot `@cloudthinker ` (with space), `Pending / In Progress / Implemented` on finding pages.
- Frontmatter titles unique (`grep '^title:' -r | sort | uniq -d`), descriptions 50–150 chars ≠ title.
- No `<Card ` without `href=`; ≤1 `<CardGroup` outside index/overviews; final H2 is `Next steps` or `Related`.
- ≤2 sentences before first `##`; sentence-case headings; prompt blocks ` ```text ` and within caps.
- Every `/images/` path in the old page still present in the new one.
- `mintlify broken-links` passes.
