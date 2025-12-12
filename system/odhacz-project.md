# Projekt: System GTD z interfejsem /odhacz

**Data:** 2025-12-12  
**Status:** W rozwoju

## Podsumowanie

System GTD oparty na plikach markdown z webowym interfejsem do odhaczania zadań i planowaną integracją z Claude AI.

---

## Architektura obecna (lokalna)

```
┌─────────────────────────────────────────────────────────────┐
│                         LOKALNIE                            │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Browser   │───▶│   Server    │───▶│   Markdown      │ │
│  │  localhost  │◀───│   Python    │◀───│   Files         │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Komponenty

| Komponent | Ścieżka | Opis |
|-----------|---------|------|
| Server | `.cursor/commands/odhacz/server.py` | HTTP server, API, git sync |
| UI | `.cursor/commands/odhacz/template.html` | Interfejs webowy |
| Logic | `.cursor/commands/odhacz/ui.js` | Logika frontendu |
| Generator | `.cursor/commands/odhacz/generate.py` | Generowanie data.js (legacy) |

### API Endpoints

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/` | GET | UI (template.html) |
| `/api/tasks` | GET | Lista tasków z filtrami |
| `/api/apply` | POST | Zapisz zmiany do plików |
| `/api/sync` | POST | Git pull + push (planowane) |
| `/api/sync/status` | GET | Status synchronizacji (planowane) |

### Parametry filtrowania `/api/tasks`

```
?path=lists/          # Filtruj po ścieżce (folder)
?checked=false        # Tylko niezrobione (true/false/all)
?search=zakupy        # Szukaj w treści
```

---

## Architektura docelowa (Railway + GitHub)

```
┌─────────────┐     ┌─────────────────────────────────────────┐
│             │     │              RAILWAY                    │
│   Browser   │     │  ┌─────────┐    ┌─────────────────────┐│
│  (anywhere) │────▶│  │ Server  │───▶│  Local Git Clone    ││
│             │◀────│  │ Python  │◀───│  (persistent vol)   ││
│             │     │  └─────────┘    └──────────┬──────────┘│
└─────────────┘     │                            │           │
                    └────────────────────────────┼───────────┘
                                                 │
                                    [Sync button]│
                                                 ▼
                                          ┌─────────────┐
                                          │   GitHub    │
                                          │  (backup)   │
                                          └─────────────┘
```

### Zalety

- ✅ Dostęp z dowolnego urządzenia (telefon, tablet)
- ✅ Historia zmian (git log)
- ✅ Backup na GitHub
- ✅ Możliwość edycji przez GitHub web/app
- ✅ HTTPS out of the box (Railway)

### Konfiguracja Railway

| Zmienna | Wartość |
|---------|---------|
| `PORT` | automatycznie przez Railway |
| `REPO_URL` | `https://github.com/lordch/todo-system.git` |
| `GITHUB_TOKEN` | Personal Access Token |
| `DATA_DIR` | `/app/data` (persistent volume) |

---

## Faza 2: Agent AI (Claude)

### Architektura z agentem

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │ Telegram │   │  Slack   │   │   API    │   │   SSH/CLI       │  │
│  │   Bot    │   │   Bot    │   │ endpoint │   │                 │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └───────┬─────────┘  │
│       │              │              │                 │            │
│       └──────────────┴──────────────┴─────────────────┘            │
│                              │                                      │
│                              ▼                                      │
│                    ┌─────────────────┐                             │
│                    │   Claude API    │                             │
│                    │  (z kontekstem  │                             │
│                    │   GTD/rules)    │                             │
│                    └────────┬────────┘                             │
│                             │                                       │
│                             ▼                                       │
│                    ┌─────────────────┐                             │
│                    │  Action Engine  │                             │
│                    │  - edit files   │                             │
│                    │  - git commit   │                             │
│                    │  - respond      │                             │
│                    └────────┬────────┘                             │
│                             │                                       │
│                             ▼                                       │
│                    ┌─────────────────┐                             │
│                    │   Markdown DB   │                             │
│                    │   (git repo)    │                             │
│                    └─────────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Możliwe polecenia dla agenta

```
# Dodawanie
"Dodaj do inbox: kupić mleko"
"Dodaj task do IKEA: półki do łazienki"

# Przeglądanie
"Co mam dziś do zrobienia?"
"Pokaż niezrobione z projektów"
"Ile mam zaległych tasków?"

# Odhaczanie
"Odhacz: wizyta u lekarza"
"Oznacz jako zrobione: zakupy w Lidlu"

# Rytuały GTD
"/plan-dnia"
"/przetworz-inbox"
"/weekly-review"

# Projekty
"Jaki jest status projektu Lawly?"
"Dodaj następny krok do projektu X: napisać email"

# Wyszukiwanie
"Znajdź wszystko związane z Mikim"
"Kiedy ostatnio byłem u lekarza?"
```

### Endpoint `/api/agent`

```python
POST /api/agent
{
  "command": "Dodaj do inbox: kupić mleko",
  "context": {
    "user": "higher",
    "timestamp": "2025-12-12T18:00:00"
  }
}

Response:
{
  "success": true,
  "action": "added_to_inbox",
  "message": "Dodano do inbox: kupić mleko",
  "file_changed": "inbox.md"
}
```

### System prompt dla Claude

Agent otrzymuje:
1. Zawartość `.cursorrules` (reguły GTD)
2. Strukturę katalogów
3. Kontekst użytkownika (data, ostatnie akcje)
4. Dostępne akcje (edit_file, git_commit, read_file, etc.)

---

## Faza 3: Telegram Bot

### Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Telegram   │  ──────▶│   Webhook    │  ──────▶│    Claude    │
│     User     │  ◀──────│   Handler    │  ◀──────│     API      │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  Git Repo    │
                         │  (actions)   │
                         └──────────────┘
```

### Przykładowa konwersacja

```
Ty: Co mam dziś?
Bot: 📅 Plan na 2025-12-12:
     □ Daily (10:00)
     □ Spotkanie z klientem (14:00)
     ☑ Odebrać paczkę
     
     Masz 2 niezrobione zadania.

Ty: Odhacz daily
Bot: ✓ Odhaczone: Daily (10:00)
     Pozostało 1 zadanie na dziś.

Ty: Dodaj do inbox: zadzwonić do mamy
Bot: ✓ Dodano do inbox: zadzwonić do mamy

Ty: /przetworz-inbox
Bot: 📥 Inbox ma 3 elementy:
     1. zadzwonić do mamy
     2. kupić prezent dla Zofki
     3. sprawdzić ubezpieczenie
     
     Zacznijmy od pierwszego: "zadzwonić do mamy"
     Co to jest? Czy to actionable?
```

---

## Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Storage | Markdown files + Git |
| Backend | Python (stdlib, no deps) |
| Frontend | Vanilla HTML/JS |
| Hosting | Railway (lub VPS) |
| AI | Claude API (Anthropic) |
| Bot | python-telegram-bot |
| Auth | Basic Auth / Telegram user ID |

---

## Roadmap

### ✅ Faza 0: Lokalne (zrobione)
- [x] Server.py z API
- [x] UI z filtrami
- [x] Automatyczny zapis do plików

### 🔄 Faza 1: Railway Deploy (w toku)
- [ ] Pliki deploy (Procfile, railway.toml)
- [ ] Git sync (pull/push na żądanie)
- [ ] Environment variables
- [ ] Deploy i test

### 📋 Faza 2: Claude Agent
- [ ] Endpoint `/api/agent`
- [ ] Integracja Claude API
- [ ] System prompt z kontekstem GTD
- [ ] Akcje: add, check, search, rituals

### 📋 Faza 3: Telegram Bot
- [ ] Webhook handler
- [ ] Konwersacyjny interfejs
- [ ] Powiadomienia (opcjonalnie)

### 📋 Faza 4: Rozszerzenia
- [ ] Front matter dla metadanych
- [ ] Tagi i konteksty GTD
- [ ] Dashboard z wykresami
- [ ] Integracja z kalendarzem

---

## Pliki projektu

```
.cursor/commands/odhacz/
├── server.py          # Główny serwer
├── template.html      # UI
├── ui.js              # Logika frontendu
├── generate.py        # Generator data.js (legacy)
├── apply.py           # Aplikowanie zmian (legacy)
├── Procfile           # Railway: jak uruchomić
├── requirements.txt   # Zależności (puste)
└── railway.toml       # Konfiguracja Railway

system/
├── odhacz-project.md  # Ten dokument
└── ideas-notes.md     # Pomysły i notatki
```

---

## Notatki techniczne

### Obsługa konfliktów Git

Gdy `git pull` zwraca konflikt:
1. Zapisz stan lokalny
2. Zrób `git stash`
3. `git pull`
4. `git stash pop`
5. Jeśli konflikt — pokaż użytkownikowi do ręcznego rozwiązania

### Rate limits Claude API

- Free tier: ograniczone
- Pro: $20/mo, wystarczające dla osobistego użytku
- Caching: cache odpowiedzi dla powtarzających się zapytań

### Bezpieczeństwo

- Basic Auth na endpointach
- HTTPS (Railway daje automatycznie)
- GitHub token z minimalnym scope
- Telegram: whitelist user ID

