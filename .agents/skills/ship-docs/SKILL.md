---
name: ship-docs
description: Ship CloudThinker documentation changes with consistent git hygiene. Use for branch naming, staging docs changes, drafting commit messages, PR titles, PR descriptions, and verifying docs-related updates before opening or updating a PR. In dry-run mode, output drafts only and never present unrun actions as completed.
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
- Default docs branch pattern: `docs/<description>`
- Use lowercase kebab-case.
- If the user explicitly requests a different branch name, use that instead.

Examples:
- `docs/add-argocd-connection-guide`
- `docs/update-kubernetes-health-monitoring`
- `docs/refine-doc-skills-workflow`

## Pre-Ship Checklist
1. Review the final diff.
2. Confirm the changed docs follow existing repo patterns.
3. Confirm required companion files were updated when applicable.
   - `docs.json`
   - `llms.txt`
   - relevant `overview.mdx`
4. Run relevant checks when applicable.
   - `mintlify broken-links` for new or changed links
   - Any targeted validation the user requested
5. Note pre-existing issues separately. Do not fold them into this docs change.

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
- [ ] Reviewed against similar docs patterns
- [ ] Updated `docs.json` when needed
- [ ] Updated `llms.txt` when needed
- [ ] Updated relevant `overview.mdx` when needed
- [ ] Ran `mintlify broken-links` when relevant

## Notes
- Call out limitations, skipped items, follow-up work, or dry-run status
```

## Truthful Reporting
- `[x]` only for work actually completed.
- `[ ]` for planned, skipped, not-run, or failed checks.
- If something was intentionally not run, say why.
- Do not present hypothetical file updates as already done.

## Ask Before Proceeding If
- The user has not asked you to commit or push yet.
- The diff includes unrelated changes.
- Validation failed and the failure source is unclear.

## Never Do
- Do not commit secrets, `.env` files, or generated junk.
- Do not create empty commits.
- Do not push forcefully unless the user explicitly requests it.
- Do not describe checks as completed if they were not run.

## Final Output to User
When shipping work, report:
- branch name
- commit message used
- PR title used
- whether changes were pushed
- PR URL if created
- checks run and their outcome
