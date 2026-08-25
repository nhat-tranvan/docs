---
name: write-docs
description: Write or update CloudThinker documentation. Use for new MDX pages, existing doc revisions, image-driven docs, and documentation structure work. Explore similar docs first and write in the repo's established pattern, then run the three mandatory checks - verify every claim against the vendor's official documentation, compare the page against its siblings, and audit the wording for jargon and leaked internals. Report what was reference-backed versus inferred.
---

# Write Docs

## When to Use
- User asks to write, rewrite, or expand docs.
- User provides screenshots or images and wants a new doc.
- User asks for a new guide, connection page, tutorial, or use case.
- User asks to restructure existing documentation content.

This repo is a Mintlify site. Pages are `.mdx` with required frontmatter, navigation lives in `docs.json`, and the LLM index lives in `llms.txt`. Per-type structure and companion-file rules are in [references/patterns.md](references/patterns.md).

## Who This Is For

The reader is a **customer**, not a CloudThinker engineer and not the vendor's operator. They already run the service. They opened this page for one reason: **to get the credential CloudThinker needs, and to paste it into the Connections form.**

In scope: which credential type the connection uses and where in the vendor's UI to create it; the least privilege that credential needs and how to grant exactly that; what to paste into each field; what the reader sees when it works and what each failure message means; what agents can then do and what the connection cannot reach.

Out of scope, so cut it and link the vendor: how to install, host, deploy, size, or upgrade the service; how to spin up a trial, cluster, instance, or sandbox; vendor concepts the reader does not need in order to produce the credential; anything about how CloudThinker is built or operated internally.

A sentence that does not help the reader produce a working credential, understand its limits, or read an error is a sentence to cut.

## Workflow

**Explore -> Decide -> Write -> Verify Against the Vendor -> Verify Against Sibling Docs -> Audit the Wording -> Report.**

Steps 4, 5, and 6 are mandatory. They are never optional and the user should never have to ask for them.

### 1. Explore
1. Identify the doc type, then read 2 or 3 of its closest siblings and capture the real pattern: section order, Mintlify components, tone and heading style, tables, callouts, related-links shape.
2. Read `docs-writing-workflow.md` when the task is a new page, image-driven docs, or carries workflow uncertainty.
3. Gather the source-of-truth inputs: material the user provided, the existing pages closest in structure, and the section's overview page.

### 2. Decide
- Separate what is reference-backed from what would be inferred.
- If the doc is procedural and the process is incomplete, stop and ask for the missing source material.
- Decide whether the section's `overview.mdx` also needs updating. It does when the page belongs in section cards, summaries, or quick-start guidance. Not every new page requires it.

### 3. Write
1. Create or edit the `.mdx` page. Add `title` and `description` frontmatter, and `icon` when the surrounding pattern uses one. Follow the closest existing page.
2. Update the companion files: `docs.json`, `llms.txt`, and the section `overview.mdx` when its pattern calls for it.

### 4. Verify Against the Vendor

The product source tells you what CloudThinker sends. It does not tell you whether the instruction you wrote to the customer is correct on the vendor's side. Look up the vendor's own current documentation and check the page against it.

Check every claim of these kinds:

1. **The credential-creation path** - the exact menu names and button labels in the vendor's current UI. Vendors rename these.
2. **The meaning of every option you tell the reader to set**, especially one you tell them to leave alone. Read what the option does before you recommend it.
3. **Permissions, roles, and scopes** - that each named role exists, and that it grants what you claim.
4. **Version floors** - which release first shipped the API or feature the connection depends on. Cite a real release, not "a recent version".
5. **Hosting options and product names you list** - vendors kill products and end-of-life versions. A platform table rots faster than any other section.
6. **Expiry, rotation, and rate-limit behavior** you describe.

Rules:

- Prefer the vendor's own documentation over a blog, a forum answer, or model memory.
- When the vendor contradicts what you inferred from the product source, the vendor wins on their side of the boundary and the product source wins on ours. Say which is which.
- When you cannot confirm a claim, cut it or mark it plainly. Never ship an unverified instruction.
- Record what you checked and what changed. It goes in the report and in the PR body.

**A fetcher summary is not a source.** A search result, a fetched-page summary, or any paraphrase a tool handed back to you is a pointer to evidence, not the evidence. Open the vendor's page and read the sentence yourself before a claim built on it ships. Three tells that a summary invented structure: two options described in near-identical words, a menu path that reads cleaner than any real UI, and a fact that appears in the summary but in none of the text it quotes. When you cannot get the verbatim sentence, the claim does not ship.

**The product source is authoritative about CloudThinker, not about the vendor.** A connector entry or an agent skill file states what our side does, and it sometimes also states what the provider does. That second kind of claim carries no more weight than a blog post and gets the same vendor check. Copying it unchecked puts our error in front of the customer under the vendor's name.

This is not hypothetical. A shipped agent skill said that stopping a machine releases its volume attachment. The vendor's documentation says the volume stays attached, and billed, until the machine is destroyed. The draft page inherited the error in the direction that costs the customer money.

When the vendor contradicts the product source about the vendor's own behavior: write the vendor's version in the page, then report the product-source error to the user with the exact `file:line`. It is a product bug, not a docs bug, and it usually lives in a repository this task does not own. Do not fix it silently in passing, and do not leave it unreported.

A wrong instruction here is worse than a missing one: it produces a credential that cannot connect, and the customer blames CloudThinker.

### 5. Verify Against Sibling Docs

A page that is correct on its own can still be an outlier. Compare it against the pages around it before reporting.

1. **Section set and order** - list the headings of 5 or more sibling pages and count how many carry each section. Match the majority shape. If you add a section few siblings have, or drop one most of them have, say why.
2. **Field naming** - follow the dominant convention for the connection-details table. When the repo is genuinely split, choose the name the customer sees in the product and say so.
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
- **One exception, deliberate.** A troubleshooting heading may quote a product error message word for word, including an internal-sounding term, because that is the string the customer will search for. Explain it in plain words underneath, and flag it in the report so it reads as a choice.
- **Re-read the frontmatter description**, and make the `llms.txt` entry and the overview row match it. They drift.
- Confirm the structure still matches the references, and check for invented claims, scope creep, broken links, and mismatches with the frontmatter or index entries.

### 7. Report

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
- Suggest `ship-docs` when the user wants commit or PR preparation
```

## Never Do
- Do not invent setup steps, UI behavior, permissions, endpoints, screenshots, or verification results.
- Do not include real credentials, tokens, passwords, customer data, or mock secrets. No fake-but-realistic samples either.
- Do not ship a vendor-side instruction you did not check against the vendor's current documentation.
- Do not report completion while any of the three checks is unrun. Name the one you skipped and why instead.
- Do not teach the reader to install, host, or scale the service. That is the vendor's documentation, not ours.
- Do not put internal engineering vocabulary in customer-facing text.
- Do not delete a section most sibling pages carry without saying so and giving the reason.
- Do not hide inferred content inside the report. Label it.
- Do not rewrite unrelated docs for style consistency.

## Ask Before Proceeding If
- The user did not provide the full process or reference material for a procedural doc.
- The page location or doc type is unclear.
- The requested content would expose secrets or unsafe operational guidance.
- The repo has conflicting patterns and no obvious nearest match.

## Completion Checklist
- Every vendor-side claim was checked against the vendor's current documentation, and the check is recorded.
- The page was compared against sibling pages for section set, field naming, depth, and components.
- The wording was audited for jargon and leaked internals, and any internal term kept was flagged.
- The page teaches credential acquisition only. No install, hosting, or scaling guidance leaked in.
- Frontmatter description, `llms.txt` entry, and overview row all say the same thing.
- MDX frontmatter is valid and the structure matches the nearest existing pattern.
- `docs.json` updated if navigation changed, `llms.txt` updated if page inventory changed, `overview.mdx` reviewed.
- The report separates reference-backed from inferred content.
- `mintlify broken-links` was run when links changed.
