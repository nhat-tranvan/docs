---
name: write-docs
description: Write or update CloudThinker documentation. Use for new MDX pages, existing doc revisions, image-driven docs, and documentation structure work. Always explore similar docs first, decide based on real references and workflow guidance, write in the repo's established pattern, verify every claim against the vendor's official documentation and against sibling pages, audit the wording for jargon and leaked internals, and report what came from references versus what was inferred.
---

# Write Docs

## When to Use
- User asks to write, rewrite, or expand docs.
- User provides screenshots/images and wants a new doc.
- User asks for a new guide, connection page, tutorial, or use case.
- User asks to restructure existing documentation content.

## Core Rules
- Follow this flow: **Explore -> Decide -> Write -> Verify Against the Vendor -> Verify Against Sibling Docs -> Audit the Wording -> Report**.
- Scan similar docs before writing anything.
- Match the target doc type instead of inventing a new structure.
- For procedural docs, require a complete source process from the user or from trusted repo references before drafting.
- Never invent setup steps, UI behavior, permissions, endpoints, screenshots, or verification results.
- Never include real credentials, tokens, passwords, customer data, or mock secrets.
- Keep language concise, direct, and action-oriented.
- Three checks are mandatory before reporting, never optional and never something the user should have to ask for: **Verify against the vendor**, **Verify against sibling docs**, **Audit the wording**. They are steps 4, 5, and 6 below.

## Who This Is For

The reader is a **customer**, not a CloudThinker engineer and not the vendor's operator. They already run the service. They opened this page for one reason: **to get the credential CloudThinker needs, and to paste it into the Connections form.**

Write for that. In scope:

- Which credential type the connection uses, and where in the vendor's UI to create it.
- The least privilege that credential needs, and how to grant exactly that.
- What to paste into each field of the CloudThinker form.
- What the reader sees when it works, and what each failure message means.
- What agents can then do, and what the connection cannot reach.

Out of scope. Cut it, and link to the vendor if the reader truly needs it:

- How to install, host, deploy, self-host, size, or upgrade the service.
- How to spin up a trial, a cluster, an instance, or a sandbox.
- Vendor concepts the reader does not need in order to produce the credential.
- Anything about how CloudThinker is built or operated internally.

A sentence that does not help the reader produce a working credential, understand its limits, or read an error is a sentence to cut.

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

### 4. Verify Against the Vendor

The product source tells you what CloudThinker sends. It does not tell you whether the instruction you wrote to the customer is correct on the vendor's side. Look the vendor's own current documentation up on the internet and check the page against it.

Check every claim of these kinds:

1. **The credential-creation path** - the exact menu names and button labels, in the vendor's current UI. Vendors rename these.
2. **The meaning of every option you tell the reader to set**, especially one you tell them to leave alone. Read what the option actually does before you recommend it.
3. **Permissions, roles, and scopes** - that each named role exists, and that it grants what you claim.
4. **Version floors** - which release first shipped the API or the feature the connection depends on. Cite a real release, not "a recent version".
5. **Hosting options and product names you list** - vendors kill products and end-of-life versions. A table of supported platforms rots faster than any other section.
6. **Expiry, rotation, and rate-limit behavior** you describe.

Rules:

- Prefer the vendor's own documentation over a blog, a forum answer, or model memory.
- When the vendor's documentation contradicts what you inferred from the product source, the vendor wins on their side of the boundary, and the product source wins on ours. Say which is which.
- When you cannot confirm a claim, cut it or mark it plainly. Do not ship an unverified instruction.
- Record what you checked and what changed as a result. It goes in the report and in the PR body.

A wrong instruction here is worse than a missing one: it produces a credential that cannot connect, and the customer blames CloudThinker.

### 5. Verify Against Sibling Docs

A page that is correct on its own can still be an outlier. Compare it against the pages around it before reporting.

1. **Section set and order** - list the headings of 5 or more sibling pages and count how many carry each section. Match the majority shape. If you add a section few siblings have, or drop one most of them have, say why.
2. **Field naming** - check how sibling pages name the fields in the connection-details table, then follow the dominant convention. When the repo is genuinely split, choose the one the customer sees in the product and say so.
3. **Depth and length** - a page far longer or shorter than its siblings is usually carrying scope that belongs elsewhere, or missing something they all have.
4. **Recurring components** - callout types, agent card icons, the related-links pattern, table shapes. Copy the sibling, do not invent.
5. **Shared claims** - when sibling pages state the same fact about CloudThinker behavior, state it the same way. A wording drift reads as a behavior difference.

Before deleting a whole section, grep the repo for that heading. If many pages carry it, the section is a convention and the problem is its contents, not the section. Fix the contents.

### 6. Audit the Wording

Read the page once more as a customer who has never seen CloudThinker's codebase. Every sentence is customer-facing text.

Cut internal engineering vocabulary:

- Internal API paths, resource groups, HTTP verbs, and endpoint names.
- Environment-variable keys in place of the field labels shown in the product. Name the label the customer reads on screen.
- Internal file, script, module, tool, agent-skill, or function names.
- Internal architecture words: sandbox, executor, gate, probe, registry, lane, budget, artifact, transport, and similar.
- Internal deployment and environment modes, such as behavior that applies only in local development.
- Internal shorthand and abbreviations the customer has never met. Spell out the vendor's own term instead.

Then:

- **Describe behavior, not implementation.** "The connection can only ask Rancher to read" beats naming the verb and the API group.
- **One exception, deliberate.** A troubleshooting heading may quote a product error message word for word, including an internal-sounding term, because that is the string the customer will search for. Explain it in plain words underneath. Flag it in the report so it reads as a choice.
- **Re-read the frontmatter description**, and make the `llms.txt` entry and the overview row match it. They drift.
- Confirm the structure still matches the references, and check for invented claims, scope creep, broken links or paths, and mismatches with frontmatter or index entries.

### 7. Report
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

## Vendor Verification
- <claim checked> -> <confirmed, or corrected to X, citing the vendor page>
- <anything you could not confirm, and what you did about it>

## Sibling Comparison
- <section set, field naming, and components checked against which pages>
- <any place this page deviates, and why>

## Wording Audit
- <jargon and internals removed, as was -> now>
- <any internal term kept on purpose, and the reason>

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
- The page teaches credential acquisition, not deployment. If the service is self-hosted, state only what the reader must know to reach it and authenticate; link the vendor for install and hosting
- Favor CloudThinker read-only or least-privilege examples when describing credentials
- Ground the connection's real behavior in the product source: the builtin connection entry for the fields and auth type, the connection test for what Connect does and every message it can return, and the agent skill for capabilities and limits
- Write each troubleshooting entry from a message the product can actually return, not from a guess about what might go wrong
- Prefer no `Supported platforms` table over a stale one. When you keep one, every row is a vendor-verified, currently supported product

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
- Do not ship a vendor-side instruction you did not check against the vendor's current documentation.
- Do not report completion while any of the three checks is unrun. Say which one you skipped and why instead.
- Do not teach the reader to install, host, or scale the service. That is the vendor's documentation, not ours.
- Do not put internal engineering vocabulary in customer-facing text.
- Do not delete a section that most sibling pages carry without saying so and giving the reason.

## Completion Checklist
- Every vendor-side claim was checked against the vendor's current documentation, and the check is recorded.
- The page was compared against sibling pages for section set, field naming, depth, and components.
- The wording was audited for jargon and leaked internals, and any internal term kept was flagged.
- The page teaches credential acquisition only; no install, hosting, or scaling guidance leaked in.
- Frontmatter description, `llms.txt` entry, and overview row all say the same thing.
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
