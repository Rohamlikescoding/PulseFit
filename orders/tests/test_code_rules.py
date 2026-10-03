"""
Static checks that keep two project rules true as the code grows:
  P3-04: only orders/services.py changes Order.status
  P3-13: no view/serializer fetches an order without the ownership filter
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKIP_PARTS = {".venv", "migrations", "tests", "__pycache__"}


def project_files():
    for path in ROOT.rglob("*.py"):
        rel = path.relative_to(ROOT)
        if SKIP_PARTS.intersection(rel.parts) or rel.name in {"conftest.py", "tests.py"}:
            continue
        yield rel, path.read_text(encoding="utf-8")


def test_status_only_changed_in_order_services():
    status_assign = re.compile(r"\.status\s*=(?!=)")
    status_update = re.compile(r"\.update\([^)]*\bstatus\s*=")
    offenders = [
        f"{rel}:{n}"
        for rel, text in project_files()
        if rel.as_posix() != "orders/services.py"
        for n, line in enumerate(text.splitlines(), 1)
        if status_assign.search(line) or status_update.search(line)
    ]
    assert offenders == [], f"Change order status via orders.services.transition(): {offenders}"


def test_views_never_fetch_orders_without_owner_filter():
    unsafe = re.compile(r"Order\.objects\.(get|filter)\(\s*(pk|id|number)=")
    offenders = [
        f"{rel}:{n}"
        for rel, text in project_files()
        if rel.name in {"views.py", "serializers.py"}
        for n, line in enumerate(text.splitlines(), 1)
        if unsafe.search(line)
    ]
    assert offenders == [], f"Use a queryset filtered by user: {offenders}"
