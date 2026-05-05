#!/usr/bin/env python3
"""Local render of the screenshot diagram, applying the renderer's prelude + style block.

Mimics what diagram_renderer.py does in the executor sandbox so we can eyeball
visual changes locally without spinning up the full backend.
"""
# /// script
# requires-python = ">=3.10"
# dependencies = ["diagrams>=0.23.4"]
# ///

import sys
from os import environ, makedirs
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RENDERER_SRC = (
    Path("/Users/bmd1905/BuilderStudio/cloud-cost-optimization/backend/app/features/artifacts/domain/diagram_renderer.py")
).read_text()


def extract_block(src: str, marker: str) -> str:
    start = src.index(f"{marker} = r\"\"\"") + len(f"{marker} = r\"\"\"")
    end = src.index("\"\"\"", start)
    return src[start:end]


prelude = extract_block(RENDERER_SRC, "_DIAGRAM_PRELUDE")

# The kind palette + override use post-init mutation that depends on diagrams.Cluster
# from the SAME process — so we exec the prelude as-is, then user code, then postlude.
out_dir = REPO / "images" / "blog-thumbnails"
makedirs(out_dir, exist_ok=True)
out_path = str(out_dir / "diagram-preview")
environ["CT_DIAGRAM_OUT"] = out_path

user_body = """
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ELB, Route53
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS, ElastiCache
from diagrams.onprem.client import Users
from os import environ

with Diagram(filename=environ['CT_DIAGRAM_OUT'], outformat='svg', show=False, direction='LR'):
    with Cluster('end users', kind='actor'):
        users = Users('customers')
    dns = Route53('app.example.com')
    with Cluster('vpc-prod', kind='vpc'):
        with Cluster('public subnet', kind='public_subnet'):
            lb = ELB('alb')
        with Cluster('app tier', kind='private_subnet'):
            web = [EC2('web-1'), EC2('web-2'), EC2('web-3')]
        with Cluster('data tier', kind='data'):
            cache = ElastiCache('redis')
            primary = RDS('primary')
            replica = RDS('replica')
            primary - Edge(label='async replication', style='dashed') - replica
    users >> Edge(label='1 HTTPS') >> dns >> Edge(label='2 resolve') >> lb
    lb >> Edge(label='3 forward') >> web
    web >> Edge(label='4 cache read') >> cache
    web >> Edge(label='5 query') >> primary
"""

# Run prelude + user body in one namespace (prelude mutates Diagram/Cluster classes;
# user body imports them and they pick up the mutations).
script = prelude + "\n" + user_body
exec(compile(script, "<diagram>", "exec"), {"__name__": "__main__"})

# Apply theme style injection (mirrors _inject_style_into_svg).
sys.path.insert(0, str(Path("/Users/bmd1905/BuilderStudio/cloud-cost-optimization/backend")))
from app.features.artifacts.domain.diagram_renderer import _inject_style_into_svg  # noqa: E402

svg_path = Path(out_path + ".svg")
svg = svg_path.read_text()
svg = _inject_style_into_svg(svg)
svg_path.write_text(svg)
print(f"OK: {svg_path} ({len(svg)} bytes)")
