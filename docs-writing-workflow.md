# Documentation writing workflow (for future me)

1. Gather inputs

- Receive the image folder and target doc path from the user.
- Note any required section order or component types (Steps, Tabs, Cards, etc.).

2. Rename images (preserve numeric prefix)

- Keep the leading number as-is; convert the rest to concise, kebab-case meaning.
- Pattern: `01-context-name.jpg`, `02-filter-pane.png`, etc.
- Aim for names that hint at where they will be used in the doc.

3. Place assets

- Move/confirm images in the specified directory (usually under `/images/...`).
- Ensure the final names match what will be referenced in MDX.

4. Study an example doc for pattern

- Open the provided example MDX to mirror structure (front matter, sections, components, tone).
- Note how images are embedded (typically via `<Frame>`), how headings are sized, and how copy is phrased.

5. Write the new doc

- Add front matter (`title`, `description`).
- Follow the example’s section flow (overview, prerequisites, workflow/steps, notes).
- Use Mintlify components consistently; place images with the renamed files and clear alt text.
- Keep language concise, action-oriented, and consistent with existing guides.

6. Update `llms.txt`

- Add a new entry for the page in the matching section of `/llms.txt`:
  ```
  - [Page Title](https://docs.cloudthinker.io/path/to/page.md): Brief description from frontmatter
  ```
- If adding a new section/group, add a corresponding `## Section Name` heading.
- If removing or renaming a page, update or remove its entry.

7. Quick checks

- Verify all image paths and alt text.
- Skim for clarity and consistency with the example.
- Confirm the new page has an entry in `llms.txt`.
- If possible, run `mintlify broken-links` when link changes are involved.
