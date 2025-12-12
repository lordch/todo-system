#!/usr/bin/env python3
"""
Aplikuje zmiany checkboxów do plików markdown.

Użycie:
    python apply.py '{"changes": [...]}'
    
    Lub przez stdin:
    echo '{"changes": [...]}' | python apply.py
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parents[2]

CHECKBOX_RE = re.compile(r"^(\s*-\s*)\[([ xX])\](.*)$")


def apply_change(file_path: Path, line_no: int, original_line: str, new_checked: bool) -> tuple[bool, str]:
    """Aplikuje zmianę do pliku. Zwraca (success, message)."""
    
    if not file_path.is_file():
        return False, f"Plik nie istnieje: {file_path}"
    
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        return False, f"Nie mogę przeczytać pliku: {e}"
    
    lines = content.splitlines(keepends=True)
    
    if line_no < 1 or line_no > len(lines):
        return False, f"Linia {line_no} poza zakresem (plik ma {len(lines)} linii)"
    
    current_line = lines[line_no - 1].rstrip('\n')
    
    # Sprawdź czy linia się zgadza (optimistic lock)
    if current_line != original_line:
        return False, f"Konflikt! Linia się zmieniła.\n  Oczekiwano: {original_line}\n  Jest: {current_line}"
    
    # Zamień checkbox
    m = CHECKBOX_RE.match(current_line)
    if not m:
        return False, f"Linia nie zawiera checkboxa: {current_line}"
    
    prefix = m.group(1)  # "- " lub "  - " etc
    suffix = m.group(3)  # reszta po checkboxie
    new_mark = "x" if new_checked else " "
    new_line = f"{prefix}[{new_mark}]{suffix}"
    
    # Zachowaj końcówkę linii
    if lines[line_no - 1].endswith('\n'):
        new_line += '\n'
    
    lines[line_no - 1] = new_line
    
    try:
        file_path.write_text(''.join(lines), encoding="utf-8")
    except Exception as e:
        return False, f"Nie mogę zapisać pliku: {e}"
    
    action = "odhaczone" if new_checked else "odznaczone"
    return True, f"L{line_no}: {action}"


def main():
    # Wczytaj JSON z argumentu lub stdin
    if len(sys.argv) > 1:
        data = sys.argv[1]
    else:
        data = sys.stdin.read()
    
    # Obsłuż format ODHACZ_CHANGES:...
    if data.startswith('ODHACZ_CHANGES:'):
        data = data[len('ODHACZ_CHANGES:'):]
    
    try:
        changes = json.loads(data)
    except json.JSONDecodeError as e:
        print(f"❌ Błąd parsowania JSON: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Obsłuż format z kluczem "changes" lub bezpośrednio listę
    if isinstance(changes, dict) and 'changes' in changes:
        changes = changes['changes']
    
    if not isinstance(changes, list):
        print("❌ Oczekiwano listy zmian", file=sys.stderr)
        sys.exit(1)
    
    if len(changes) == 0:
        print("Brak zmian do zapisania")
        sys.exit(0)
    
    print(f"Aplikuję {len(changes)} zmian...\n")
    
    success_count = 0
    error_count = 0
    
    for ch in changes:
        file_rel = ch.get('file', '')
        line_no = ch.get('line', 0)
        original_line = ch.get('original_line', '')
        new_checked = ch.get('checked', False)
        
        file_path = REPO_ROOT / file_rel
        
        ok, msg = apply_change(file_path, line_no, original_line, new_checked)
        
        if ok:
            print(f"✓ {file_rel} {msg}")
            success_count += 1
        else:
            print(f"✗ {file_rel} L{line_no}: {msg}")
            error_count += 1
    
    print(f"\n{'='*40}")
    print(f"Zakończono: {success_count} sukces, {error_count} błędów")
    
    sys.exit(0 if error_count == 0 else 1)


if __name__ == "__main__":
    main()

