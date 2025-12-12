# Deploy /odhacz na Railway

## Kroki

### 1. Przygotowanie GitHub Token

1. Idź do: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Wybierz scope: `repo` (full control of private repositories)
4. Skopiuj token (zapisz w bezpiecznym miejscu!)

### 2. Utwórz projekt na Railway

1. Idź do: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Wybierz repo: `lordch/todo-system`
4. Railway automatycznie wykryje `Procfile`

### 3. Dodaj Volume (persistent storage)

1. W projekcie Railway: **Variables** → **Volumes**
2. **Add Volume**
3. Mount path: `/app/data`
4. Zapisz

### 4. Ustaw zmienne środowiskowe

W **Variables** dodaj:

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `PORT` | (auto) | Railway ustawi automatycznie |
| `REPO_URL` | `https://github.com/lordch/todo-system.git` | URL do repo |
| `GITHUB_TOKEN` | `ghp_xxx...` | Token z kroku 1 |
| `DATA_DIR` | `/app/data` | Ścieżka do volume |
| `AUTH_USER` | `higher` | Użytkownik do basic auth |
| `AUTH_PASS` | `twoje-hasło` | Hasło (wymyśl bezpieczne!) |

### 5. Deploy

1. Railway automatycznie zdeployuje
2. Poczekaj ~2 min
3. Kliknij **View Logs** aby zobaczyć:
   ```
   📦 Klonowanie https://github.com/lordch/todo-system.git...
   ✓ Sklonowano do /app/data
   🔄 Pull...
   🚀 Odhacz server
      URL: http://0.0.0.0:XXXX/
      Mode: Railway
      Auth: ✓
      Sync: ✓
   ```

### 6. Otwórz aplikację

1. Railway pokaże URL typu: `https://twoja-app.railway.app`
2. Otwórz w przeglądarce
3. Zaloguj się (użytkownik + hasło z AUTH_*)

### 7. Testuj

1. **Odhacz** jakiś task
2. Kliknij **Zapisz** → lokalnie zapisane
3. Kliknij **🔄 Sync** → push do GitHub
4. Sprawdź na GitHub czy commit się pojawił

## Troubleshooting

### Błąd klonowania

```
❌ Błąd klonowania: fatal: could not read Username
```

**Fix:** Sprawdź czy `GITHUB_TOKEN` jest poprawny i ma scope `repo`.

### Konflikty git

Jeśli edytujesz pliki lokalnie i na Railway równocześnie:
- Sync pokaże błąd konfliktu
- Rozwiąż ręcznie przez GitHub web lub lokalnie

### Auth nie działa

Sprawdź czy przeglądarka pamięta stare dane logowania:
- Otwórz w trybie incognito
- Lub wyczyść cache

## Koszty

- **Volume**: $0.20/GB/miesiąc (~$0.20 dla todo repo)
- **Compute**: $5/miesiąc (hobby plan)
- **Razem**: ~$5.20/mc

Alternatywa: Hetzner VPS €3.79/mc (ale więcej setupu).

