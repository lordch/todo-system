# /odhacz — Interfejs do odhaczania zadań

Webowy interfejs do przeglądania i odhaczania zadań. Działa lokalnie i na Railway.

---

## Tryb lokalny (development)

### Uruchomienie

```bash
cd /Users/higher/Documents/todo
python3 .cursor/commands/odhacz/server.py 9999
```

W przeglądarce: `http://localhost:9999/`

### Workflow

1. **Filtruj** — wybierz folder (areas, lists, projects, daily plans)
2. **Szukaj** — wyszukaj task po treści
3. **Klikaj** checkboxy
4. **Zapisz** — zmiany od razu w plikach lokalnych

**Brak sync** — pracujesz bezpośrednio na lokalnych plikach.

---

## Tryb Railway (produkcja)

### Deploy

Zobacz: [RAILWAY.md](RAILWAY.md)

### Użycie

1. Otwórz: `https://twoja-app.railway.app/`
2. Zaloguj się (basic auth)
3. Filtruj, szukaj, odhaczaj jak w trybie lokalnym
4. **Zapisz** → zmiany w lokalnym klonie na serwerze
5. **🔄 Sync** → `git pull + push` do GitHub

### Kiedy używać Sync

- Po odhaczeniu wielu tasków
- Przed zamknięciem przeglądarki
- Gdy chcesz mieć backup na GitHub
- Gdy pracujesz z wielu urządzeń

**Sync status pokazuje:**
- Ile czasu temu był ostatni sync
- Czy są niezapisane zmiany (gwiazdka *)

---

## Filtry

| Filtr | Wartości | Opis |
|-------|----------|------|
| Folder | areas, lists, projects, daily plans | Wybierz źródło |
| Status | Wszystkie / Niezrobione / Zrobione | Stan checkboxów |
| Szukaj | tekst | Szuka w treści tasków |

---

## API (dla agenta)

### GET /api/tasks

Parametry:
- `?path=lists/` — filtruj po ścieżce
- `?checked=false` — tylko niezrobione (true/false/all)
- `?search=tekst` — szukaj

Odpowiedź:
```json
{
  "tasks": [
    {"file": "lists/IKEA.md", "line": 3, "text": "- [ ] Task", "checked": false, "original_line": "..."}
  ],
  "folders": ["areas", "lists", "projects", "daily plans"],
  "total": 42
}
```

### POST /api/apply

Body:
```json
{
  "changes": [
    {"file": "lists/IKEA.md", "line": 3, "original_line": "- [ ] Task", "checked": true}
  ]
}
```

Odpowiedź:
```json
{
  "updated": [{"file": "lists/IKEA.md", "line": 3, "action": "odhaczone"}],
  "errors": []
}
```

### POST /api/sync (tylko Railway)

Wykonuje `git pull + push`.

Odpowiedź:
```json
{
  "success": true,
  "message": "Zsynchronizowane",
  "details": {"pull": "...", "push": "..."}
}
```

---

## Dla agenta: jak używać /odhacz

### Użytkownik mówi co chce zobaczyć

Przykłady:
- "Pokaż IKEA"
- "Co mam niezrobione w projektach"
- "Daily plan na dziś"

### Agent odpowiada

**Lokalnie:**
```
Uruchamiam serwer lokalny...
Otwórz: http://localhost:9999/?path=lists/IKEA.md
```

**Railway:**
```
Otwórz: https://twoja-app.railway.app/?path=lists/IKEA.md
Zaloguj się (użytkownik/hasło z Railway).
```

### Użytkownik pracuje

- Klika checkboxy
- Zapisuje
- (Railway) Syncuje gdy chce

### Użytkownik kończy

Mówi "zakończone" lub zamyka przeglądarkę. Koniec.

---

## Pliki

- `server.py` — backend (API, git sync, auth)
- `template.html` — UI
- `ui.js` — logika frontendu
- `Procfile` — Railway: jak uruchomić
- `railway.toml` — Railway: konfiguracja volume
- `RAILWAY.md` — instrukcja deploy
