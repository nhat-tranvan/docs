# Documentation writing workflow (for future me)

1. Explore first

- Receive the target doc path, source process/reference material, and any image folder from the user.
- Identify the doc type and read 2-3 similar docs first.
- Note the real section order, component usage (`Steps`, `Tabs`, `Cards`, etc.), and tone.
- If there is a relevant section landing page such as `overview.mdx`, inspect it to decide whether the new page should also appear there.

2. Decide before drafting

- Separate source-backed material from anything you would be inferring from repo patterns.
- For procedural docs, stop and ask if the user has not provided the full process reference.
- Decide which companion files may need updates:
  - `docs.json`
  - `llms.txt`
  - contextual `overview.mdx`

3. Rename images (preserve numeric prefix)

- Keep the leading number as-is; convert the rest to concise, kebab-case meaning.
- Pattern: `01-context-name.jpg`, `02-filter-pane.png`, etc.
- Aim for names that hint at where they will be used in the doc.

4. Place assets

- Move/confirm images in the specified directory (usually under `/images/...`).
- Ensure the final names match what will be referenced in MDX.

5. Study an example doc for pattern

- Open the provided example MDX to mirror structure (front matter, sections, components, tone).
- Note how images are embedded (typically via `<Frame>`), how headings are sized, and how copy is phrased.

6. Write the new doc

- Add front matter (`title`, `description`).
- Follow the example’s section flow (overview, prerequisites, workflow/steps, notes).
- Use Mintlify components consistently; place images with the renamed files and clear alt text.
- Keep language concise, action-oriented, and consistent with existing guides.

7. Update companion files

- Add/update the page in `docs.json` if navigation changed.
- Add a new entry for the page in the matching section of `/llms.txt`:
  ```
  - [Page Title](https://docs.cloudthinker.io/path/to/page.md): Brief description from frontmatter
  ```
- If adding a new section/group, add a corresponding `## Section Name` heading.
- If removing or renaming a page, update or remove its entry.
- If the section overview should surface this new page, update the relevant `overview.mdx`.

8. Read everything again

- Re-read the final doc top-to-bottom.
- Re-check companion files touched by the change.
- Verify all image paths and alt text.
- Skim for clarity and consistency with the example.
- If possible, run `mintlify broken-links` when link changes are involved.

9. Report references vs inference

- Tell the user which references you followed.
- State what content was directly grounded in references or user-provided process material.
- State what you inferred from repo patterns or surrounding docs.
- If the work is ready to ship, suggest using `ship-docs` for branch / commit / PR prep.
