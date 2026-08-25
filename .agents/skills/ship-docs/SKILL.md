---
name: ship-docs
description: Ship CloudThinker documentation changes with consistent git hygiene. Use for branch naming, staging docs changes, drafting commit messages, PR titles, PR descriptions, and verifying docs-related updates before opening or updating a PR. Blocks the ship when the vendor check, the sibling-docs check, or the wording audit did not run. In dry-run mode, output drafts only and never present unrun actions as completed.
---

# Ship Docs

## When to Use
- User asks to commit documentation changes.
- User asks to prepare or create a PR for docs work.
- User asks for branch, commit-message, PR-title, or PR-description cleanup.

## Core Rules
- Only commit or push when the user explicitly asks.
- Keep docs commits scoped to the documentation task.
- Default to truthful dry-run behavior until the user asks for git actions.
- Commit message, PR title, and PR body should explain the user-facing docs outcome, not just list filenames.
- Include verification notes only for checks that were actually run.

## Branch Naming
- Docs branch pattern: `docs/<description>`, the majority form. `<author>/docs/<description>` is also established here and is fine. Read `git branch -r` before deciding; it is the record of what this repo actually uses, and it holds both.
- Use lowercase kebab-case.
- If the user explicitly requests a different branch name, use that instead.

Examples:
- `docs/add-argocd-connection-guide`
- `docs/update-kubernetes-health-monitoring`
- `docs/fix-broken-links`

## Where to Push
- Push the branch to `origin`, the shared docs repo, and open the PR from that branch.
- Do not push to a personal fork. Run `gh api repos/<owner>/<repo> --jq .permissions` before assuming a fork is needed; contributors here have push access.
- Read the remote list and the existing branch names before inventing a convention. Both are one command away, and both are authoritative.

## Commit Authorship
- Read the last few commits before committing, and match their author identity and trailer convention.
- Use the author's canonical display name, not their host handle.
- Amending an unpushed local commit to correct this is fine. Never force-push to correct a pushed one.

## Pre-Ship Checklist
1. Review the final diff.
2. Confirm the three content gates ran. They are defined in `write-docs`, steps 4 to 6. Do not ship a content change until all three are done.
   - **Vendor check** - every vendor-side instruction confirmed against the vendor's current official documentation.
   - **Sibling check** - section set, field naming, depth, and components compared against neighbouring pages, and any deviation explained.
   - **Wording audit** - no jargon, internal names, internal paths, or internal architecture terms in customer-facing text, and no install or hosting guidance that belongs to the vendor.
   - If one did not run, stop and run it. If it genuinely cannot run, say which and why, in the report and in the PR body. Never mark it `[x]`.
3. Confirm the changed docs follow existing repo patterns.
4. Confirm required companion files were updated when applicable.
   - `docs.json`
   - `llms.txt`
   - relevant `overview.mdx`
   - Confirm the frontmatter description, the `llms.txt` entry, and the overview row still agree with each other.
5. Run relevant checks when applicable.
   - `mintlify broken-links` for new or changed links
   - Any targeted validation the user requested
6. Stage explicitly by path. Never `git add -A` or `git add .` in a tree that carries unrelated work.
7. Note pre-existing issues separately. Do not fold them into this docs change.

## Dry-Run Mode
- Default behavior is draft-only output.
- In dry-run mode, provide:
  - proposed branch name
  - draft commit message
  - draft PR title
  - draft PR description
  - checks that would be run
- Never mark unchecked work as complete.
- Use honest language such as `Would update`, `Draft`, `Planned`, or unchecked boxes `[ ]`.

## Commit Message Format
Use a conventional subject line:

```text
docs: add argocd connection guide
docs: update kubernetes health monitoring walkthrough
docs: refine documentation skill workflow
```

Guidance:
- Start with `docs:` unless the change is clearly chore-only.
- Use a short lowercase subject line.
- Prefer `add`, `update`, `fix`, or `refine` based on intent.
- Scope the subject to the user-visible outcome.

## PR Title Format
- Default to the same style as the commit subject.
- Keep it concise and outcome-focused.

Examples:
- `docs: add argocd connection guide`
- `docs: refine write-docs and ship-docs workflow`

## PR Description Template
Use this structure:

```md
## Summary
- Explain the user-facing docs outcome
- Note any new pages, guidance, or workflow coverage added

## What Changed
- New files added
- Existing files updated
- Navigation / index / overview changes

## Checks
- [ ] Verified every vendor-side instruction against the vendor's official docs
- [ ] Compared against sibling pages for section set, field naming, and components
- [ ] Audited customer-facing wording for jargon and internal details
- [ ] Reviewed against similar docs patterns
- [ ] Updated `docs.json` when needed
- [ ] Updated `llms.txt` when needed
- [ ] Updated relevant `overview.mdx` when needed
- [ ] Ran `mintlify broken-links` when relevant

## Notes
- Call out limitations, skipped items, follow-up work, or dry-run status
- Name anything corrected by the vendor check, and any internal term kept on purpose
```

When the vendor check changed an instruction, put that in `## Summary`, not in `## Notes`. A corrected instruction is the most valuable thing in the PR, because the wrong version would have shipped a credential that cannot connect.

## Truthful Reporting
- `[x]` only for work actually completed.
- `[ ]` for planned, skipped, not-run, or failed checks.
- If something was intentionally not run, say why.
- Do not present hypothetical file updates as already done.

## Ask Before Proceeding If
- The user has not asked you to commit or push yet.
- The diff includes unrelated changes.
- Validation failed and the failure source is unclear.
- A vendor-side instruction could not be confirmed against the vendor's documentation.
- The page deviates from its siblings and the deviation is a judgement call the user owns.

## Never Do
- Do not commit secrets, `.env` files, or generated junk.
- Do not create empty commits.
- Do not force-push. Never `--force`, never `--force-with-lease`. Add a commit instead.
- Do not describe checks as completed if they were not run.
- Do not ship a content change with the vendor check, the sibling check, or the wording audit unrun.
- Do not stage unrelated files that happen to be dirty in the tree.

## Final Output to User
When shipping work, report:
- branch name
- commit message used
- PR title used
- whether changes were pushed
- PR URL if created
- checks run and their outcome, including the three content gates
- anything the vendor check corrected
- unrelated files left untouched in the working tree
