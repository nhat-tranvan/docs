---
name: write-docs
description: Write or update CloudThinker documentation. Use for new MDX pages, existing doc revisions, image-driven docs, and documentation structure work. Always explore similar docs first, decide based on real references and workflow guidance, write in the repo's established pattern, read the result again, and report what came from references versus what was inferred.
---

# Write Docs

## When to Use
- User asks to write, rewrite, or expand docs.
- User provides screenshots/images and wants a new doc.
- User asks for a new guide, connection page, tutorial, or use case.
- User asks to restructure existing documentation content.

## Core Rules
- Follow this flow: **Explore -> Decide -> Write -> Read Again -> Report**.
- Scan similar docs before writing anything.
- Match the target doc type instead of inventing a new structure.
- For procedural docs, require a complete source process from the user or from trusted repo references before drafting.
- Never invent setup steps, UI behavior, permissions, endpoints, screenshots, or verification results.
- Never include real credentials, tokens, passwords, customer data, or mock secrets.
- Keep language concise, direct, and action-oriented.

## Required Repo Awareness
- This repo is a Mintlify docs site.
- Main navigation lives in `docs.json`.
- LLM index lives in `llms.txt` and must stay in sync.
- Workflow reference: `docs-writing-workflow.md`.
- Content uses `.mdx` files with required frontmatter.

## Workflow

### 1. Explore
1. Identify the target doc type.
   - Connection doc: `guide/connections/*.mdx`
   - Tutorial: `guide/tutorial/*.mdx`
   - Use case: `guide/use-cases/*.mdx`
   - Feature/guide page: nearby `guide/**.mdx`
2. Read 2-3 similar docs and capture the real pattern.
   - Section order
   - Mintlify components used
   - Tone and heading style
   - Tables, callouts, related-links pattern
3. Read `docs-writing-workflow.md` when the task involves a new page, image-driven docs, or workflow uncertainty.
4. Gather the source-of-truth inputs.
   - User-provided process/reference material
   - Existing repo docs with the closest structure
   - Any relevant overview page for the section

### 2. Decide
- Decide what is reference-backed versus what would be inferred.
- If the doc is procedural and the process is incomplete, stop and ask for the missing source material.
- If the section has an `overview.mdx`, decide whether it should also be updated.
  - Update the overview when the new page should appear in section cards, summaries, or quick-start guidance.
  - Do not assume every new page requires an overview change.

### 3. Write
1. Create or edit the MDX page.
   - Add required frontmatter: `title`, `description`
   - Add `icon` when the surrounding pattern uses it
   - Follow the closest existing doc pattern
2. Update companion files when needed.
   - `docs.json` for navigation
   - `llms.txt` for the LLM index
   - relevant `overview.mdx` only when the section pattern calls for it

### 4. Read Again
- Re-read the final doc from top to bottom before reporting completion.
- Confirm the structure still matches the references.
- Check for invented claims, accidental scope creep, broken links/paths, and mismatches with frontmatter or index entries.

### 5. Report
Report back to the user with these sections:

```md
## References Used
- <file or source>

## Pattern Followed
- <which doc family / structure you matched>

## Reference-Backed Content
- <facts, steps, sections grounded in provided references>

## Inferred Content
- <anything you inferred from repo patterns or context>

## Follow-Up
- Suggest using `ship-docs` when the user wants commit / PR preparation
```

## Pattern Checklist

### All Docs
- Required frontmatter: `title`, `description`
- Use sentence-case, direct copy
- Prefer real sections over long prose walls
- Add related links only when the surrounding doc family does so

### Connection Docs
- Usually include: overview/value, prerequisites, setup, permissions, capabilities, troubleshooting, security, related links
- Reuse existing connection pages for section order
- If the service is self-hosted or infrastructure-heavy, require exact deployment/setup references first
- Favor CloudThinker read-only or least-privilege examples when describing credentials

### Tutorials / Walkthroughs
- Usually center on `<Steps>` and a clear outcome
- Require the full task flow and expected order from the user
- Use commands, screenshots, and checkpoints only when provided or directly verifiable

### Image-Driven Docs
- Follow `docs-writing-workflow.md`
- Preserve numeric prefixes in image names
- Use kebab-case descriptions
- Store images under `/images/...`
- Use:

```mdx
<Frame>
  <img src="/images/path/file.jpg" alt="Descriptive alt text" />
</Frame>
<p style={{textAlign: 'center', fontSize: '0.9em', color: '#666', marginTop: '8px'}}>Visible caption</p>
```

## `docs.json` Rules
- Add new pages to the correct navigation group.
- Use page paths without the `.mdx` suffix.
- Do not create a new group if an existing group already fits.
- If unsure where a page belongs, inspect nearby siblings first.

## `llms.txt` Rules
- Keep sections aligned with navigation groups.
- Use `.md` URLs, not `.mdx`.
- Description should mirror the page frontmatter description.
- Add, update, or remove entries whenever the underlying page changes accordingly.

## Ask Before Proceeding If
- The user did not provide the full process/reference material for a procedural doc.
- The page location or doc type is unclear.
- The requested content would expose secrets or unsafe operational guidance.
- The repo has multiple conflicting patterns and no obvious nearest match.

## Never Do
- Do not invent process steps.
- Do not use fake tokens, realistic secrets, or misleading sample credentials.
- Do not forget `docs.json` / `llms.txt` when page inventory changes.
- Do not rewrite unrelated docs for style consistency.
- Do not hide inferred content inside the report; label it explicitly.

## Completion Checklist
- Similar docs were reviewed first.
- `docs-writing-workflow.md` was consulted when relevant.
- MDX frontmatter is valid.
- Structure matches the nearest existing pattern.
- `docs.json` updated if navigation changed.
- `llms.txt` updated if page inventory changed.
- `overview.mdx` reviewed when section landing-page updates might be needed.
- No sensitive data or invented process details were introduced.
- Final report clearly separates reference-backed versus inferred content.
- If link changes were involved, run `mintlify broken-links` when feasible.
