## GitButler

Repo uses **GitButler** (virtual branches, stacked PRs, smart history). Always on `gitbutler/workspace`.

### Concepts

- **Workspace branch**: `gitbutler/workspace` — never manually switch off it
- **Virtual branches**: coexist in same working dir, no stash/switch
- **Stacked**: dependent branches rebase propagates automatically

### CLI (`but`)

`status` · `branch` (new/delete/list/show — no rename) · `commit` · `absorb` (auto-slot hunks into best commit) · `reword` · `uncommit` · `squash` · `amend` · `push` · `pull` · `pr` · `undo` · `oplog` · `diff` · `discard` · `setup` · `teardown`

### Commit Workflow

```bash
but stage <file> --branch <branch-name>          # one file at a time
but commit --no-hooks --only -m "msg" <branch>   # both flags MANDATORY
```

- **`--only` MANDATORY**: without it, commit includes ALL workspace changes (every virtual branch), not just staged-to-target
- **`--no-hooks` MANDATORY**: GitButler hooks run against ALL workspace files; can fail on other branches' lint AND **stash/lose unstaged changes**. Flag is `--no-hooks` (NOT `--no-verify`, which is a git flag and misbehaves with `but`)

Other flags: `-p <ids>` (specific hunks) · `-c` (create branch) · `-i` (AI commit msg)

### Branch Rename

CLI has no rename. To push under a different remote name, commit with `but commit` and rename + create MR via GitButler UI.

### Rules

- No raw `git checkout`/`switch` — use `but branch`
- Don't leave `gitbutler/workspace`
- `but status` over `git status` for accurate virtual-branch state
- Modifying commands auto-create undo points; use `but undo` to recover
- `--json`/`-j` for script-friendly output
