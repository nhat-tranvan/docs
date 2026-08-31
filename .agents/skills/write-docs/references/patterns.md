# Doc Patterns

Per-type structure rules and the companion-file conventions. Read the section for the doc type you are writing.

## Doc types

| Type | Path |
|---|---|
| Connection doc | `guide/connections/*.mdx` |
| Tutorial | `guide/tutorial/*.mdx` |
| Use case | `guide/use-cases/*.mdx` |
| Feature or guide page | nearby `guide/**.mdx` |

## All docs

- Required frontmatter: `title`, `description`.
- Sentence-case, direct copy. Concise and action-oriented.
- Prefer real sections over long prose walls.
- Add related links only when the surrounding doc family does.

## Connection docs

- Usual sections: overview or value, prerequisites, setup, permissions, capabilities, troubleshooting, security, related links. Reuse an existing connection page for the order.
- The page teaches credential acquisition, not deployment. When the service is self-hosted, state only what the reader must know to reach it and authenticate, then link the vendor for install and hosting.
- Favor read-only or least-privilege credential examples.
- Ground the connection's real behavior in the product source: the builtin connection entry for the fields and auth type, the connection test for what Connect does and every message it can return, and the agent skill for capabilities and limits. The product source is authoritative about CloudThinker only. Every claim it makes about the vendor still needs the vendor check.
- Write each troubleshooting entry from a message the product can actually return, not from a guess about what might go wrong.
- Prefer no `Supported platforms` table over a stale one. When you keep one, every row is a vendor-verified, currently supported product.

## Tutorials and walkthroughs

- Usually center on `<Steps>` and one clear outcome.
- Require the full task flow and its expected order from the user.
- Use commands, screenshots, and checkpoints only when provided or directly verifiable.

## Image-driven docs

- Follow `docs-writing-workflow.md`.
- Preserve numeric prefixes in image names, use kebab-case descriptions, and store images under `/images/...`.

```mdx
<Frame>
  <img src="/images/path/file.jpg" alt="Descriptive alt text" />
</Frame>
<p style={{textAlign: 'center', fontSize: '0.9em', color: '#666', marginTop: '8px'}}>Visible caption</p>
```

## `docs.json`

- Add the page to the correct navigation group. Inspect nearby siblings when the group is unclear.
- Use page paths without the `.mdx` suffix.
- Do not create a new group when an existing one fits.

## `llms.txt`

- Keep sections aligned with the navigation groups.
- Use `.md` URLs, not `.mdx`.
- The description mirrors the page frontmatter description.
- Add, update, or remove the entry whenever the underlying page changes.

## Keeping the three in agreement

The frontmatter description, the `llms.txt` entry, and the `overview.mdx` row describe the same page and drift apart easily. Re-read all three together before reporting, and again after resolving any merge conflict.
