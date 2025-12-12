#!/usr/bin/env python3
"""
Generuje data.js z checkboxów w podanych plikach markdown.

Użycie:
    python generate.py lists/IKEA.md
    python generate.py "daily plans/*.md"
    python generate.py areas/ lists/IKEA.md projects/
"""

import hashlib
import json
import re
import sys
from pathlib import Path

CHECKBOX_RE = re.compile(r"^(\s*-\s*)\[(?P<mark>[ xX])\](\s+.*)$")
SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parents[2]  # .cursor/commands/odhacz -> repo root
DATA_JS = SCRIPT_DIR / "data.js"


def task_id(file_rel: str, line_no: int, text: str) -> str:
    h = hashlib.sha1()
    h.update(f"{file_rel}:{line_no}:{text}".encode())
    return h.hexdigest()[:12]


def extract_tasks(path: Path, repo_root: Path) -> list[dict]:
    tasks = []
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"⚠️  Nie mogę przeczytać {path}: {e}", file=sys.stderr)
        return tasks

    file_rel = str(path.relative_to(repo_root))
    
    for idx, line in enumerate(content.splitlines(), start=1):
        m = CHECKBOX_RE.match(line)
        if not m:
            continue
        checked = m.group("mark").lower() == "x"
        tasks.append({
            "id": task_id(file_rel, idx, line),
            "file": file_rel,
            "line": idx,
            "text": line,
            "checked": checked,
            "original_line": line,
        })
    
    return tasks


def resolve_paths(args: list[str], repo_root: Path) -> list[Path]:
    """Rozwiązuje argumenty na listę plików .md"""
    files = []
    
    for arg in args:
        p = repo_root / arg
        
        if p.is_file() and p.suffix == ".md":
            files.append(p)
        elif p.is_dir():
            files.extend(sorted(p.rglob("*.md")))
        elif "*" in arg:
            files.extend(sorted(repo_root.glob(arg)))
        else:
            print(f"⚠️  Nie znaleziono: {arg}", file=sys.stderr)
    
    return files


def main():
    if len(sys.argv) < 2:
        print("Użycie: python generate.py <pliki lub katalogi>", file=sys.stderr)
        print("Przykłady:", file=sys.stderr)
        print("  python generate.py lists/IKEA.md", file=sys.stderr)
        print("  python generate.py 'daily plans/*.md'", file=sys.stderr)
        print("  python generate.py areas/ lists/ projects/", file=sys.stderr)
        sys.exit(1)

    files = resolve_paths(sys.argv[1:], REPO_ROOT)
    
    if not files:
        print("❌ Brak plików do przetworzenia", file=sys.stderr)
        sys.exit(1)

    all_tasks = []
    for f in files:
        tasks = extract_tasks(f, REPO_ROOT)
        all_tasks.extend(tasks)
        if tasks:
            print(f"✓ {f.relative_to(REPO_ROOT)}: {len(tasks)} zadań")

    # Generuj data.js
    js_content = "const TASKS = " + json.dumps(all_tasks, ensure_ascii=False, indent=2) + ";\n"
    DATA_JS.write_text(js_content, encoding="utf-8")
    
    print(f"\n📄 Wygenerowano {DATA_JS.name}: {len(all_tasks)} zadań z {len(files)} plików")


if __name__ == "__main__":
    main()

