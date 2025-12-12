#!/usr/bin/env python3
"""
Serwer /odhacz - markdowny jako baza danych.

Działa lokalnie i na Railway z git sync.
"""

import base64
import json
import os
import re
import subprocess
import sys
import urllib.parse
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
CHECKBOX_RE = re.compile(r"^(\s*-\s*)\[([ xX])\](.*)$")

# Env vars
PORT = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 9999))
REPO_URL = os.environ.get("REPO_URL", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
DATA_DIR = Path(os.environ.get("DATA_DIR", ""))
AUTH_USER = os.environ.get("AUTH_USER", "")
AUTH_PASS = os.environ.get("AUTH_PASS", "")

# Tryb pracy
IS_RAILWAY = bool(REPO_URL and DATA_DIR)
REPO_ROOT = DATA_DIR if IS_RAILWAY else SCRIPT_DIR.parents[2]

GTD_PATHS = ["inbox.md", "waiting-for.md", "someday-maybe.md", "areas", "lists", "projects", "daily plans"]

# Stan sync
last_sync = None
pending_changes = False


def git_exec(args: list, cwd: Path = None) -> tuple[bool, str]:
    """Wykonuje komendę git. Zwraca (success, output)."""
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=str(cwd or REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)


def git_clone():
    """Klonuje repo do DATA_DIR."""
    if not REPO_URL:
        return False, "Brak REPO_URL"
    
    if DATA_DIR.exists() and (DATA_DIR / ".git").exists():
        return True, "Repo już istnieje"
    
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    url = REPO_URL
    if GITHUB_TOKEN:
        url = REPO_URL.replace("https://", f"https://{GITHUB_TOKEN}@")
    
    ok, out = git_exec(["clone", url, str(DATA_DIR)])
    
    if ok:
        # Skonfiguruj git identity
        git_exec(["config", "user.name", "Railway Odhacz"], DATA_DIR)
        git_exec(["config", "user.email", "odhacz@railway.app"], DATA_DIR)
        
        # Skonfiguruj remote z tokenem
        if GITHUB_TOKEN:
            remote_url = REPO_URL.replace("https://", f"https://{GITHUB_TOKEN}@")
            git_exec(["remote", "set-url", "origin", remote_url], DATA_DIR)
    
    return ok, out


def git_pull():
    """Pull zmian z GitHub (bez rebase)."""
    global last_sync
    ok, out = git_exec(["pull", "--no-rebase"], REPO_ROOT)
    if ok:
        last_sync = datetime.now()
    return ok, out


def git_push():
    """Push zmian do GitHub (bez commit - zakładamy że już zcommitowane)."""
    ok, out = git_exec(["push"], REPO_ROOT)
    if ok:
        global last_sync, pending_changes
        last_sync = datetime.now()
        pending_changes = False
    return ok, out


def git_commit_and_push():
    """Commit + Push."""
    # 1. Commit
    git_exec(["add", "."], REPO_ROOT)
    git_exec(["commit", "-m", f"odhacz: push {datetime.now().isoformat()}"], REPO_ROOT)
    
    # 2. Push
    return git_push()


def git_sync():
    """Pull + Push z obsługą uncommitted changes."""
    # 1. Commit wszystkie lokalne zmiany
    git_exec(["add", "."], REPO_ROOT)
    commit_ok, commit_out = git_exec(["commit", "-m", f"odhacz: sync {datetime.now().isoformat()}"], REPO_ROOT)
    
    # 2. Pull (merge, nie rebase)
    pull_ok, pull_out = git_pull()
    if not pull_ok:
        if "CONFLICT" in pull_out:
            return False, {"error": "conflict", "details": pull_out}
        # Inne błędy pull nie są krytyczne
    
    # 3. Push
    push_ok, push_out = git_exec(["push"], REPO_ROOT)
    
    if push_ok:
        global last_sync, pending_changes
        last_sync = datetime.now()
        pending_changes = False
        return True, {"message": "Zsynchronizowane", "commits": commit_out, "pull": pull_out, "push": push_out}
    else:
        return False, {"error": "push_failed", "details": push_out}


def scan_tasks(path_filter: str = "", checked_filter: str = "all", search: str = "") -> list:
    """Skanuje markdowny i zwraca listę tasków z sekcjami."""
    tasks = []
    files_to_scan = []
    
    for gtd_path in GTD_PATHS:
        p = REPO_ROOT / gtd_path
        if p.is_file() and p.suffix == ".md":
            files_to_scan.append(p)
        elif p.is_dir():
            files_to_scan.extend(sorted(p.rglob("*.md")))
    
    header_re = re.compile(r"^(#{1,6})\s+(.+)$")
    
    for file_path in files_to_scan:
        file_rel = str(file_path.relative_to(REPO_ROOT))
        
        if path_filter and not file_rel.startswith(path_filter):
            continue
        
        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception:
            continue
        
        current_section = None
        
        for idx, line in enumerate(content.splitlines(), start=1):
            # Sprawdź czy to header
            header_match = header_re.match(line)
            if header_match:
                level = len(header_match.group(1))
                title = header_match.group(2)
                current_section = {"level": level, "title": title}
                continue
            
            # Sprawdź czy to checkbox
            m = CHECKBOX_RE.match(line)
            if not m:
                continue
            
            is_checked = m.group(2).lower() == "x"
            
            if checked_filter == "true" and not is_checked:
                continue
            if checked_filter == "false" and is_checked:
                continue
            
            if search and search.lower() not in line.lower():
                continue
            
            tasks.append({
                "file": file_rel,
                "line": idx,
                "text": line,
                "checked": is_checked,
                "original_line": line,
                "section": current_section,
            })
    
    return tasks


def apply_changes(changes: list) -> dict:
    """Aplikuje zmiany do plików."""
    global pending_changes
    results = {"updated": [], "errors": []}
    
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
                results["errors"].append({"file": file_rel, "line": line_no, "error": "Konflikt"})
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
                pending_changes = True
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
    return sorted(folders)


class OdhaczHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SCRIPT_DIR), **kwargs)
    
    def check_auth(self) -> bool:
        """Sprawdza basic auth (jeśli ustawione)."""
        if not AUTH_USER or not AUTH_PASS:
            return True
        
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Basic "):
            self.send_auth_required()
            return False
        
        try:
            encoded = auth_header[6:]
            decoded = base64.b64decode(encoded).decode("utf-8")
            user, pwd = decoded.split(":", 1)
            if user == AUTH_USER and pwd == AUTH_PASS:
                return True
        except Exception:
            pass
        
        self.send_auth_required()
        return False
    
    def send_auth_required(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="odhacz"')
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"401 Unauthorized")
    
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # Health check bez auth
        if parsed.path == "/health":
            self.send_json({"status": "ok", "mode": "Railway" if IS_RAILWAY else "Local"})
            return
        
        if not self.check_auth():
            return
        
        if parsed.path == "/api/tasks":
            params = urllib.parse.parse_qs(parsed.query)
            path_filter = params.get("path", [""])[0]
            checked_filter = params.get("checked", ["all"])[0]
            search = params.get("search", [""])[0]
            
            tasks = scan_tasks(path_filter, checked_filter, search)
            folders = get_folders()
            
            self.send_json({"tasks": tasks, "folders": folders, "total": len(tasks)})
        
        elif parsed.path == "/api/sync/status":
            status = {
                "is_railway": IS_RAILWAY,
                "last_sync": last_sync.isoformat() if last_sync else None,
                "pending_changes": pending_changes,
                "repo_url": REPO_URL if REPO_URL else None,
            }
            self.send_json(status)
        
        elif parsed.path == "/api/file":
            params = urllib.parse.parse_qs(parsed.query)
            file_rel = params.get("path", [""])[0]
            
            if not file_rel:
                self.send_json({"error": "Missing path parameter"}, status=400)
                return
            
            file_path = REPO_ROOT / file_rel
            
            if not file_path.is_file():
                self.send_json({"error": "Plik nie istnieje"}, status=404)
                return
            
            try:
                content = file_path.read_text(encoding="utf-8")
                import hashlib
                content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
                
                self.send_json({
                    "file": file_rel,
                    "content": content,
                    "lines": len(content.splitlines()),
                    "hash": content_hash
                })
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        
        elif parsed.path == "/" or parsed.path == "/index.html":
            self.path = "/template.html"
            super().do_GET()
        
        else:
            super().do_GET()
    
    def do_POST(self):
        global pending_changes
        
        if not self.check_auth():
            return
        
        if self.path == "/api/add-task":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                data = json.loads(body)
                file_rel = data.get("file", "")
                task_text = data.get("text", "").strip()
            except json.JSONDecodeError:
                self.send_json({"error": "Invalid JSON"}, status=400)
                return
            
            if not file_rel or not task_text:
                self.send_json({"error": "Missing file or text"}, status=400)
                return
            
            file_path = REPO_ROOT / file_rel
            
            if not file_path.is_file():
                self.send_json({"error": "Plik nie istnieje"}, status=404)
                return
            
            try:
                content = file_path.read_text(encoding="utf-8")
                # Dodaj task na końcu pliku
                new_task = f"- [ ] {task_text}\n"
                if not content.endswith('\n'):
                    new_task = '\n' + new_task
                file_path.write_text(content + new_task, encoding="utf-8")
                pending_changes = True
                
                self.send_json({"success": True, "file": file_rel, "text": task_text})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        
        elif self.path == "/api/apply":
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
        
        elif self.path == "/api/file":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                data = json.loads(body)
                file_rel = data.get("file", "")
                new_content = data.get("content", "")
                original_hash = data.get("original_hash", "")
            except json.JSONDecodeError:
                self.send_json({"error": "Invalid JSON"}, status=400)
                return
            
            if not file_rel:
                self.send_json({"error": "Missing file"}, status=400)
                return
            
            file_path = REPO_ROOT / file_rel
            
            if not file_path.is_file():
                self.send_json({"error": "Plik nie istnieje"}, status=404)
                return
            
            try:
                # Sprawdź hash (optimistic locking)
                current_content = file_path.read_text(encoding="utf-8")
                import hashlib
                current_hash = hashlib.sha256(current_content.encode()).hexdigest()[:16]
                
                if original_hash and current_hash != original_hash:
                    self.send_json({"error": "Konflikt - plik został zmieniony"}, status=409)
                    return
                
                # Zapisz nową treść
                file_path.write_text(new_content, encoding="utf-8")
                pending_changes = True
                
                self.send_json({
                    "success": True,
                    "file": file_rel,
                    "lines": len(new_content.splitlines())
                })
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        
        elif self.path == "/api/sync":
            if not IS_RAILWAY:
                self.send_json({"error": "Sync available only on Railway"}, status=400)
                return
            
            ok, result = git_sync()
            if ok:
                self.send_json({"success": True, "message": "Zsynchronizowane", "details": result})
            else:
                self.send_json({"success": False, "error": result}, status=409)

        elif self.path == "/api/git/pull":
            if not IS_RAILWAY:
                self.send_json({"error": "Sync available only on Railway"}, status=400)
                return
            
            ok, out = git_pull()
            if ok:
                self.send_json({"success": True, "message": "Pobrano zmiany", "details": out})
            else:
                self.send_json({"success": False, "error": out}, status=500)

        elif self.path == "/api/git/push":
            if not IS_RAILWAY:
                self.send_json({"error": "Sync available only on Railway"}, status=400)
                return
            
            ok, out = git_commit_and_push()
            if ok:
                self.send_json({"success": True, "message": "Wysłano zmiany", "details": out})
            else:
                self.send_json({"success": False, "error": out}, status=500)
        
        else:
            self.send_json({"error": "Not Found"}, status=404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {args[0]}")


def main():
    # Railway: sklonuj repo jeśli nie istnieje
    if IS_RAILWAY:
        git_dir = DATA_DIR / ".git"
        
        if git_dir.exists():
            print(f"✓ Repo już istnieje: {DATA_DIR}")
            
            # Skonfiguruj git identity
            git_exec(["config", "user.name", "Railway Odhacz"], DATA_DIR)
            git_exec(["config", "user.email", "odhacz@railway.app"], DATA_DIR)
            
            # Upewnij się że remote ma token
            if GITHUB_TOKEN:
                remote_url = REPO_URL.replace("https://", f"https://{GITHUB_TOKEN}@")
                git_exec(["remote", "set-url", "origin", remote_url], DATA_DIR)
                print("✓ Remote URL zaktualizowany z tokenem")
            
            print("🔄 Pull...")
            ok, out = git_pull()
            if not ok:
                print(f"⚠️  Pull warning: {out}")
        else:
            # Sprawdź czy DATA_DIR jest pusty
            if DATA_DIR.exists():
                try:
                    files = list(DATA_DIR.iterdir())
                    if files:
                        print(f"⚠️  {DATA_DIR} ma {len(files)} plików, próbuję sklonować do podkatalogu...")
                        # Klonuj do repo/ w DATA_DIR jeśli katalog nie jest pusty
                        clone_target = DATA_DIR / "repo"
                        if not clone_target.exists():
                            print(f"📦 Klonowanie {REPO_URL} do {clone_target}...")
                            url = REPO_URL
                            if GITHUB_TOKEN:
                                url = REPO_URL.replace("https://", f"https://{GITHUB_TOKEN}@")
                            ok, out = git_exec(["clone", url, str(clone_target)])
                            if ok:
                                global REPO_ROOT
                                REPO_ROOT = clone_target
                                print(f"✓ Sklonowano do {clone_target}")
                            else:
                                print(f"❌ Błąd: {out}")
                                sys.exit(1)
                        else:
                            REPO_ROOT = clone_target
                            print(f"✓ Używam {clone_target}")
                        return
                except Exception as e:
                    print(f"⚠️  Błąd: {e}")
            
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            print(f"📦 Klonowanie {REPO_URL}...")
            ok, out = git_clone()
            if not ok:
                print(f"❌ Błąd klonowania: {out}")
                sys.exit(1)
            print(f"✓ Sklonowano do {DATA_DIR}")
    
    host = "0.0.0.0" if IS_RAILWAY else "127.0.0.1"
    
    print(f"\n🚀 Odhacz server")
    print(f"   URL: http://{host}:{PORT}/")
    print(f"   Root: {REPO_ROOT}")
    print(f"   Mode: {'Railway' if IS_RAILWAY else 'Local'}")
    print(f"   Auth: {'✓' if AUTH_USER else '✗'}")
    print(f"   Sync: {'✓' if IS_RAILWAY else '✗'}")
    print(f"\nCtrl+C aby zatrzymać\n")
    
    httpd = HTTPServer((host, PORT), OdhaczHandler)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
