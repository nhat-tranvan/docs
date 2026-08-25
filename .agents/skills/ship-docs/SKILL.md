---
name: ship-docs
description: Ship CloudThinker documentation changes with consistent git hygiene. Use for branch naming, staging docs changes, drafting commit messages, PR titles, PR descriptions, and verifying docs updates before opening or updating a PR. Blocks the ship when the vendor check, the sibling-docs check, or the wording audit did not run. Opening a PR needs the user's word in the turn that asks for it. In dry-run mode, output drafts only and never present unrun actions as completed.
---

# Ship Docs

## When to Use
- User asks to commit documentation changes.
- User asks to prepare or create a PR for docs work.
- User asks for branch, commit-message, PR-title, or PR-description cleanup.

## Permission Ladder

Each rung is a separate permission. Holding one does not grant the next.

| Action | Needs |
|---|---|
| Draft, edit, verify | Nothing. This is the default. |
| Commit and push a branch | The user asks. Quiet and reversible. |
| Open a PR | The user asks **in the turn that asks for it**. Outward-facing: it notifies reviewers and spends their attention. |
| Approve, merge, close | The user's word in that session. No earlier permission carries over. |

"Write the guide for X" is not authorization to ship. Write the page, run every check, report what is ready, and hold.

Pushing a correction to a PR the user already opened is covered by an instruction to fix issues. Editing that PR's body is not, so ask first.

## Core Rules
- Keep docs commits scoped to the documentation task.
- Default to truthful dry-run behavior until the user asks for git actions.
- Commit message, PR title, and PR body explain the user-facing docs outcome, not a list of filenames.
- Include verification notes only for checks that actually ran.

## Branch, Remote, Authorship
- Branch pattern `docs/<description>` is the majority form here; `<author>/docs/<description>` is also established and fine. Read `git branch -r` before deciding. Lowercase kebab-case. Honor an explicitly requested name.
- Push to `origin`, the shared docs repo, and open the PR from that branch. Do not push to a personal fork. Contributors here have push access; confirm with `gh api repos/<owner>/<repo> --jq .permissions` rather than assuming.
- Read the last few commits and match their author identity and trailer convention. Use the author's canonical display name, not their host handle. Amending an unpushed local commit to fix this is fine; never force-push to fix a pushed one.

## Shared Index Files and Cross-Page Links

Several docs PRs are usually open at once and they all edit the same three files: `docs.json`, `llms.txt`, and the relevant `overview.mdx`. Plan for that before you write the diff.

- **Only link to a page that exists on `main`.** A link to a page still sitting in another open PR passes review and then breaks the link check as soon as the branches land in the wrong order. Confirm with `git ls-tree origin/main -- <path>`. When the page you want is not merged yet, link an already-merged sibling and say so in the report.
- **Insert each index entry at a line no other open PR touches.** Appending to the end of a nav group, or placing the row beside a long-settled neighbour, costs nothing and avoids the conflict. Two PRs that both insert after the same line conflict even though neither is wrong.
- **When a sibling PR merges first, resolve with a merge, never a rebase.** Run `git merge origin/main`, resolve the index files by hand so every entry from both branches survives in the agreed order, re-run `mint broken-links`, then push. Rebasing a pushed branch requires a force-push, which is banned.
- After any conflict resolution, re-read the frontmatter description, the `llms.txt` entry, and the `overview.mdx` row together. That is the easiest place to drop one of the three.

## Pre-Ship Checklist
1. Review the final diff.
2. Confirm the three content gates ran. They are defined in `write-docs`, steps 4 to 6. Do not ship a content change until all three are done.
   - **Vendor check** - every vendor-side instruction confirmed against the vendor's current official documentation.
   - **Sibling check** - section set, field naming, depth, and components compared against neighbouring pages, and any deviation explained.
   - **Wording audit** - no jargon, internal names, internal paths, or internal architecture terms in customer-facing text, and no install or hosting guidance that belongs to the vendor.
   - If one did not run, stop and run it. If it genuinely cannot run, say which and why, in the report and in the PR body. Never mark it `[x]`.
3. Confirm the changed docs follow existing repo patterns.
4. Confirm `docs.json`, `llms.txt`, and the relevant `overview.mdx` were updated when applicable, and that all three still agree with the frontmatter description.
5. Run `mint broken-links` for new or changed links, plus any validation the user asked for.
6. Stage explicitly by path. Never `git add -A` or `git add .` in a tree that carries unrelated work.
7. Note pre-existing issues separately. Do not fold them into this docs change.

## Message Formats

Conventional subject line, shared by the commit and the PR title:

```text
docs: add argocd connection guide
docs: update kubernetes health monitoring walkthrough
docs: refine write-docs and ship-docs workflow
```

Start with `docs:` unless the change is clearly chore-only. Short, lowercase, outcome-focused. Prefer `add`, `update`, `fix`, or `refine` by intent.

## PR Description Template

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
- [ ] Updated `docs.json`, `llms.txt`, and `overview.mdx` when needed
- [ ] Ran `mint broken-links` when relevant

## Notes
- Call out limitations, skipped items, follow-up work, or dry-run status
- Name anything corrected by the vendor check, and any internal term kept on purpose
```

When the vendor check changed an instruction, put that in `## Summary`, not in `## Notes`. A corrected instruction is the most valuable thing in the PR, because the wrong version would have shipped a credential that cannot connect.

## Honest Reporting
- Default output is draft-only: proposed branch name, draft commit message, draft PR title, draft PR description, and the checks that would run.
- `[x]` only for work actually completed. `[ ]` for planned, skipped, not-run, or failed. Say why anything was intentionally skipped.
- Use `Would update`, `Draft`, or `Planned` for work not yet done. Never present a hypothetical file update as done.

## Ask Before Proceeding If
- The user has not asked you to commit or push yet.
- The work is finished and verified but the user has not asked for a PR.
- A page you want to cross-link is not on `main` yet.
- The diff includes unrelated changes.
- Validation failed and the failure source is unclear.
- A vendor-side instruction could not be confirmed against the vendor's documentation.
- The page deviates from its siblings and the deviation is a judgement call the user owns.

## Never Do
- Do not open a PR the user did not ask for in that turn.
- Do not force-push. Never `--force`, never `--force-with-lease`. Add a commit instead.
- Do not rebase a pushed branch to clear a conflict. Merge `origin/main` into it.
- Do not commit secrets, `.env` files, or generated junk.
- Do not create empty commits.
- Do not stage unrelated files that happen to be dirty in the tree.
- Do not describe checks as completed if they were not run.
- Do not ship a content change with the vendor check, the sibling check, or the wording audit unrun.
- Do not build a claim on a summary a tool paraphrased back to you. Read the vendor's sentence.

## Final Output to User
Branch name, commit message used, PR title used, whether anything was pushed, PR URL if created, the checks that ran and their outcome including the three content gates, anything the vendor check corrected, and the unrelated files left untouched in the working tree.
