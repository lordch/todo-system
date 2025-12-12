#!/usr/bin/env python3
"""
Serwer /odhacz - markdowny jako baza danych.

Endpointy:
  GET  /api/tasks?path=...&checked=...&search=...  - lista tasków z filtrami
  POST /api/apply                                   - zapisz zmiany
  GET  /                                            - UI
"""

import json
import re
import sys
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parents[2]
CHECKBOX_RE = re.compile(r"^(\s*-\s*)\[([ xX])\](.*)$")

# Zakres GTD (bez system/, mem-agent-mcp/, .cursor/)
GTD_PATHS = [
    "inbox.md",
    "waiting-for.md",
    "someday-maybe.md",
    "areas",
    "lists",
    "projects",
    "daily plans",
]


def scan_tasks(path_filter: str = "", checked_filter: str = "all", search: str = "") -> list:
    """Skanuje markdowny i zwraca listę tasków."""
    tasks = []
    
    files_to_scan = []
    
    for gtd_path in GTD_PATHS:
        p = REPO_ROOT / gtd_path
        if p.is_file() and p.suffix == ".md":
            files_to_scan.append(p)
        elif p.is_dir():
            files_to_scan.extend(sorted(p.rglob("*.md")))
    
    for file_path in files_to_scan:
        file_rel = str(file_path.relative_to(REPO_ROOT))
        
        # Filtr po ścieżce
        if path_filter and not file_rel.startswith(path_filter):
            continue
        
        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception:
            continue
        
        for idx, line in enumerate(content.splitlines(), start=1):
            m = CHECKBOX_RE.match(line)
            if not m:
                continue
            
            is_checked = m.group(2).lower() == "x"
            
            # Filtr checked/unchecked
            if checked_filter == "true" and not is_checked:
                continue
            if checked_filter == "false" and is_checked:
                continue
            
            # Filtr search
            if search and search.lower() not in line.lower():
                continue
            
            tasks.append({
                "file": file_rel,
                "line": idx,
                "text": line,
                "checked": is_checked,
                "original_line": line,
            })
    
    return tasks


def apply_changes(changes: list) -> dict:
    """Aplikuje zmiany do plików."""
    results = {"updated": [], "errors": []}
    
    # Grupuj zmiany po pliku
    by_file = {}
    for ch in changes:
        file_rel = ch.get("file", "")
        if file_rel not in by_file:
            by_file[file_rel] = []
        by_file[file_rel].append(ch)
    
    for file_rel, file_changes in by_file.items():
        file_path = REPO_ROOT / file_rel
        
        if not file_path.is_file():
            results["errors"].append({"file": file_rel, "error": "Plik nie istnieje"})
            continue
        
        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception as e:
            results["errors"].append({"file": file_rel, "error": str(e)})
            continue
        
        lines = content.splitlines(keepends=True)
        modified = False
        
        for ch in file_changes:
            line_no = ch.get("line", 0)
            original_line = ch.get("original_line", "")
            new_checked = ch.get("checked", False)
            
            if line_no < 1 or line_no > len(lines):
                results["errors"].append({"file": file_rel, "line": line_no, "error": "Linia poza zakresem"})
                continue
            
            current_line = lines[line_no - 1].rstrip('\n')
            
            if current_line != original_line:
                results["errors"].append({
                    "file": file_rel, 
                    "line": line_no, 
                    "error": f"Konflikt"
                })
                continue
            
            m = CHECKBOX_RE.match(current_line)
            if not m:
                results["errors"].append({"file": file_rel, "line": line_no, "error": "Brak checkboxa"})
                continue
            
            prefix = m.group(1)
            suffix = m.group(3)
            new_mark = "x" if new_checked else " "
            new_line = f"{prefix}[{new_mark}]{suffix}"
            
            if lines[line_no - 1].endswith('\n'):
                new_line += '\n'
            
            lines[line_no - 1] = new_line
            modified = True
            action = "odhaczone" if new_checked else "odznaczone"
            results["updated"].append({"file": file_rel, "line": line_no, "action": action})
        
        if modified:
            try:
                file_path.write_text(''.join(lines), encoding="utf-8")
            except Exception as e:
                results["errors"].append({"file": file_rel, "error": str(e)})
    
    return results


def get_folders() -> list:
    """Zwraca listę dostępnych folderów."""
    folders = set()
    for gtd_path in GTD_PATHS:
        p = REPO_ROOT / gtd_path
        if p.is_dir():
            folders.add(gtd_path)
            for sub in p.iterdir():
                if sub.is_dir():
                    folders.add(str(sub.relative_to(REPO_ROOT)))
    return sorted(folders)


class OdhaczHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR), **kwargs)
    
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == "/api/tasks":
            params = urllib.parse.parse_qs(parsed.query)
            path_filter = params.get("path", [""])[0]
            checked_filter = params.get("checked", ["all"])[0]
            search = params.get("search", [""])[0]
            
            tasks = scan_tasks(path_filter, checked_filter, search)
            folders = get_folders()
            
            self.send_json({"tasks": tasks, "folders": folders, "total": len(tasks)})
        
        elif parsed.path == "/" or parsed.path == "/index.html":
            self.path = "/template.html"
            super().do_GET()
        
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == "/api/apply":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                data = json.loads(body)
                changes = data.get("changes", [])
            except json.JSONDecodeError:
                self.send_json({"error": "Invalid JSON"}, status=400)
                return
            
            result = apply_changes(changes)
            self.send_json(result)
        else:
            self.send_json({"error": "Not Found"}, status=404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def log_message(self, format, *args):
        if "/api/" in args[0]:
            print(f"[API] {args[0]}")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
    
    print(f"🚀 Odhacz: http://localhost:{port}/")
    print(f"📁 Root: {REPO_ROOT}")
    print(f"📂 Foldery: {', '.join(GTD_PATHS)}")
    print("Ctrl+C aby zatrzymać\n")
    
    httpd = HTTPServer(("127.0.0.1", port), OdhaczHandler)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
