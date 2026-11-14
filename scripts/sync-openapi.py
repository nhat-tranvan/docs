#!/usr/bin/env python3
"""Copy the Public API spec into api-reference/ with short page URLs and titles.

The backend spec is the source of truth. Its summaries read well in the CLI
(`Read the calling token: user, scopes, ...`) but make long Mintlify slugs. This
adds an `x-mint` block per operation: the URL comes from the operationId
(`chat.runs.create` -> /api-reference/chat/runs-create) and the page title is the
summary before its first colon. Each page names its scope, and
snippets/api-areas.mdx lists the areas from the spec tags for the overview.

Usage: python3 scripts/sync-openapi.py <path to public-v1.json>
  e.g. git -C ../../ct show origin/develop:backend/app/features/public_api/spec/public-v1.json > /tmp/x.json
"""

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "api-reference" / "openapi.json"
AREAS = OUT.parent.parent / "snippets" / "api-areas.mdx"
METHODS = {"get", "post", "put", "patch", "delete"}
SKIP_AREAS = {"token"}  # a utility call, not a product area


def scope_line(scope: str | None) -> str:
    if scope is None:
        return "**Scope:** none. Any valid token can call this."
    return f"**Scope:** `{scope}`. See [API Tokens](/guide/api/tokens#scopes)."


def short_title(summary: str) -> str:
    return summary.split(":", 1)[0].rstrip(".").strip()


def href(operation_id: str) -> str:
    tag, *rest = operation_id.split(".")
    return f"/api-reference/{tag}/{'-'.join(rest)}"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    spec = json.loads(Path(sys.argv[1]).read_text())
    seen: set[str] = set()
    first_page: dict[str, str] = {}
    for path_item in spec["paths"].values():
        for method, op in path_item.items():
            if method not in METHODS:
                continue
            url = href(op["operationId"])
            if url in seen:
                sys.exit(f"duplicate page URL {url}")
            seen.add(url)
            title = short_title(op["summary"])
            op["x-mint"] = {
                "href": url,
                "metadata": {"title": title, "sidebarTitle": title},
                "content": scope_line(op.get("x-scope")),
            }
            first_page.setdefault(op["tags"][0], url)
    OUT.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
    rows = [
        f"| [{tag['name'].capitalize()}]({first_page[tag['name']]}) | {tag['description'].rstrip('.')} |"
        for tag in spec["tags"]
        if tag["name"] in first_page and tag["name"] not in SKIP_AREAS
    ]
    AREAS.write_text("| Area | What it does |\n| --- | --- |\n" + "\n".join(rows) + "\n")
    print(f"{len(seen)} operations -> {OUT.relative_to(OUT.parent.parent)}; {len(rows)} areas -> {AREAS.relative_to(AREAS.parent.parent)}")


if __name__ == "__main__":
    main()
