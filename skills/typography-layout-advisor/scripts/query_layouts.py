#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
LAYOUTS = json.loads((ROOT / "references" / "layouts.json").read_text(encoding="utf-8"))
CATEGORIES = json.loads((ROOT / "references" / "categories.json").read_text(encoding="utf-8"))
CATEGORY_NAMES = {item["id"]: item["name"] for item in CATEGORIES}


def normalize(value):
    return " ".join(str(value).lower().split())


def searchable(layout):
    values = [
        layout["id"], layout["nameZh"], layout["nameEn"], layout["description"],
        *layout["keywords"], *layout["suitableFor"], *layout["avoidFor"],
        CATEGORY_NAMES.get(layout["categoryId"], ""),
    ]
    return normalize(" ".join(values))


def score(layout, query):
    if not query:
        return 1
    text = searchable(layout)
    terms = [term for term in normalize(query).split(" ") if term]
    if not terms:
        return 1
    value = 0
    for term in terms:
        if term in normalize(layout["id"]):
            value += 20
        if term in normalize(layout["nameZh"]) or term in normalize(layout["nameEn"]):
            value += 12
        if term in text:
            value += 3
    return value


def render(layout):
    return "\n".join([
        f"### {layout['id']} {layout['nameZh']} / {layout['nameEn']}",
        f"- 分类：{layout['categoryId']} {CATEGORY_NAMES[layout['categoryId']]}",
        f"- 原理：{layout['description']}",
        f"- 特征：{' / '.join(layout['keywords'])}",
        f"- 适合：{'；'.join(layout['suitableFor'])}",
        f"- 避免：{'；'.join(layout['avoidFor'])}",
        f"- 同类：{' / '.join(layout['relatedIds'])}",
        f"- 预览：assets/layouts/{layout['id']}.webp",
    ])


parser = argparse.ArgumentParser(description="检索文字版式画廊的 72 种版式")
parser.add_argument("--query", "-q", default="", help="名称、说明、关键词或使用场景")
parser.add_argument("--id", dest="layout_id", help="精确版式编号，例如 D04")
parser.add_argument("--category", "-c", help="分类编号 A-H 或分类中文名")
parser.add_argument("--limit", "-n", type=int, default=8, help="最多输出多少条，默认 8")
parser.add_argument("--json", action="store_true", help="输出 JSON")
args = parser.parse_args()

matches = LAYOUTS
if args.layout_id:
    matches = [item for item in matches if normalize(item["id"]) == normalize(args.layout_id)]
if args.category:
    category_query = normalize(args.category)
    category_ids = [item["id"] for item in CATEGORIES if category_query in normalize(item["id"]) or category_query in normalize(item["name"])]
    matches = [item for item in matches if item["categoryId"] in category_ids]

ranked = [(score(item, args.query), item) for item in matches]
ranked = [(value, item) for value, item in ranked if value > 0]
ranked.sort(key=lambda pair: (-pair[0], pair[1]["id"]))
results = [item for _, item in ranked[:max(args.limit, 0)]]

if args.json:
    print(json.dumps(results, ensure_ascii=False, indent=2))
elif results:
    print("\n\n".join(render(item) for item in results))
else:
    print("没有找到匹配的版式。请换用结构、场景、路径或内容类型词检索。")
