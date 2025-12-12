# Design systemu: /odhacz + Claude Agent SDK + Markdown DB

**Data:** 2025-12-12  
**Status:** projekt (do wdrożenia iteracyjnie)  
**Zakres:** web app „Cursor na telefon” dla repozytorium GTD (markdown jako baza danych), z podwójnym interfejsem: klasyczne UI + chat sterowany naturalnym językiem.  

---

## 1) Cel i obraz końcowy

Chcę mieć jedną aplikację webową (mobile-first), w której mogę:

- **Otworzyć dowolny plik markdown** (podgląd, wyszukiwanie, edycja w kontrolowanym zakresie).
- **Zobaczyć listę zadań** (checkboxy) agregowaną z wielu źródeł (pliki i foldery), z filtrami (np. niezrobione, tekst, tagi, kontekst, typ pliku).
- **Odhaczać zadania** jak dziś (bezpiecznie, z ochroną przed konfliktami).
- **Sterować widokiem i akcjami językiem naturalnym**: „pokaż mi dzisiaj + telefon”, „otwórz listę IKEA”, „znajdź Luxmed”, „odhacz ‘Abonament’ w planie z 8 grudnia”, „dodaj do inbox: …”, „przenieś to do projektu X”.
- **Mieć ‘podwójny interfejs’**:
  - **UI klasyczne**: listy, filtry, checkboxy, edycja pliku, nawigacja.
  - **Chat**: rozmowa, polecenia, podpowiedzi, automatyczne ustawianie widoku, propozycje zmian (z możliwością akceptacji).

W skrócie: **„Cursor w telefonie”** — ale z markdown jako DB i z agentem, który nie “klika w UI”, tylko zwraca strukturalne polecenia dla aplikacji.

---

## 2) Zasady projektowe

### 2.1 Bezpieczeństwo i przewidywalność
- Agent **nie powinien mieć pełnej swobody zapisu do filesystemu** bez walidacji domenowej.
- Każda zmiana w plikach przechodzi przez **warstwę walidacji** (allowlista ścieżek, brak wyjścia poza repo, brak modyfikacji plików systemowych).
- Zmiany są wykonywane jako **małe, atomowe operacje** (toggle checkbox, wstaw task, przenieś task) z mechanizmem konfliktów.

### 2.2 “Sterowanie UI” = protokół akcji, nie automatyzacja DOM
- Agent zwraca JSON z intencją i listą akcji UI (np. `setFilters`, `openFile`, `showToast`, `draftChanges`).
- UI jest deterministyczne: te akcje **zawsze** prowadzą do tych samych rezultatów.
- Agent **nie** manipuluje elementami strony; manipuluje stanem aplikacji.

### 2.3 Markdown jako DB, Front matter jako schemat
- Markdown pozostaje głównym nośnikiem treści.
- Front matter (YAML) daje **metadane** i możliwość budowania „widoków” (dashboards) bez bazy SQL.
- Checkboxy w treści pozostają kompatybilne z obecnym `/odhacz`.

### 2.4 Minimalizm implementacyjny
- Backend pozostaje prosty (Python stdlib jest OK), ale rozszerzamy API.
- Agent SDK (Node) jako komponent pomocniczy (sidecar) — tylko tam gdzie ma największy sens.

---

## 3) Model danych

### 3.1 Pojęcia
- **Źródło (source)**: plik `.md` albo folder zawierający `.md`.
- **Task**: linia pasująca do checkboxa `- [ ]` lub `- [x]` (z zachowaniem całej linii).
- **Dokument**: markdown z opcjonalnym front matter.
- **View**: definicja agregacji (źródła + filtry), może być generowana przez agenta albo zapisana w front matter.

### 3.2 Standard front matter (minimalny)

Na początku pliku (opcjonalnie):

```yaml
---
title: Telefon
type: list               # list | project | area | daily | note | view
aliases:
  - tel
  - phone
  - zadania telefon
tags: [gtd]
contexts: [Telefon]
status: "🟢"             # opcjonalnie
created: "2025-12-12"    # opcjonalnie
updated: "2025-12-12"    # opcjonalnie
---
```

**Wymagania**:
- Front matter jest interpretowany tylko jeśli pojawia się **na samym początku pliku**.
- Backend skanujący tasks **ignoruje blok front matter** (żeby YAML nie wpływał na task parsing).
- Ignorowanie nie zmienia numerów linii w pliku — po prostu nie traktujemy tych linii jako taski.

### 3.3 Front matter dla “widoków” (type: view)

Plik „widoku” może zawierać definicje agregacji:

```yaml
---
title: Dashboard
type: view
views:
  today_plus_phone:
    label: "Dzisiaj + Telefon + Inbox"
    sources:
      - "daily plans/{{today}}.md"
      - "lists/Telefon.md"
      - "inbox.md"
    filters:
      checked: false
      search: ""
      tags: []
---
```

**Notatki**:
- `{{today}}` to placeholder rozwiązywany po stronie backendu (strefa PL).
- `sources` może wskazywać foldery (`lists/`) lub pliki (`lists/IKEA.md`).

### 3.4 Task object (model API)

Task zwracany do UI i do agenta:

```json
{
  "file": "lists/Telefon.md",
  "line": 27,
  "text": "- [ ] Zadzwonić do …",
  "checked": false,
  "original_line": "- [ ] Zadzwonić do …",
  "heading_path": ["Sekcja A", "Podsekcja"],
  "doc": {
    "title": "Telefon",
    "type": "list",
    "aliases": ["tel", "phone"],
    "tags": ["gtd"],
    "contexts": ["Telefon"]
  }
}
```

**Uwagi**:
- `original_line` jest “optimistic lock” (już działa w `/api/apply`).
- `heading_path` pomaga agentowi i UI (lepsza nawigacja niż sama linia).
- `doc` jest parse front matter (lub puste wartości, jeśli brak).

### 3.5 Schemat wykrywania headingów
- `heading_path` budowane na bazie nagłówków Markdown (`#`, `##`, `###` itd.).
- Task “dziedziczy” aktualny `heading_path` w momencie wystąpienia w pliku.

---

## 4) Operacje na plikach (domenowe)

### 4.1 Podstawowe operacje
- **Open file**: zwróć treść + metadane (front matter, etag/hash, typ).
- **Search**: znajdź w repo (po nazwie pliku, po treści, po tasks).
- **List sources**: lista dopuszczonych folderów i plików (GTD allowlist).
- **Show tasks**: agregacja z wielu źródeł + filtry.
- **Toggle task**: zmiana `checked` dla konkretnej linii.
- **Insert task**: dodaj linię `- [ ] …` w wybrane miejsce.
- **Move task**: usuń linię w pliku A i wstaw w pliku B (operacja transakcyjna).
- **Edit file** (kontrolowane): patch/replace fragmentu, z walidacją (np. nie usuwać front matter bez powodu).

### 4.2 Konflikty i spójność
- Każda operacja zapisu powinna przyjmować:
  - `file`, `expected_etag` (hash całego pliku) **albo** `original_line` dla operacji liniowych.
- Jeśli plik zmienił się między odczytem a zapisem → błąd konfliktu + UI proponuje odświeżenie.

### 4.3 ETag / wersjonowanie
- Serwer zwraca `etag = sha1(content)` dla pliku.
- UI przy zapisie przekazuje `If-Match: <etag>` (lub pole `expected_etag`).

---

## 5) Warstwy systemu (architektura)

### 5.1 Komponenty

**A) Web app (UI)**
- Single-page UI (vanilla JS jest OK) z dwoma trybami:
  - „Tasks”: odhaczanie, listy, filtry, agregacja
  - „Files”: podgląd/edycja plików
  - „Chat”: panel rozmowy (współdzielony z Tasks/Files)

**B) Python backend (orchestrator + domain rules)**
- Serwuje UI.
- Implementuje domenowe API i walidacje.
- Zawiera indeksowanie markdownów (task scan) + front matter parse.

**C) Agent service (Node, Claude Agent SDK)**
- Odpowiada za:
  - rozumienie naturalnego języka,
  - mapowanie do intencji i “UI actions”,
  - (opcjonalnie) używanie filesystem tools do odczytu kontekstu.
- Zwraca **tylko JSON** (bez HTML).

### 5.2 Dlaczego Node sidecar
- Claude Agent SDK jest natywnie JS/TS.
- Python utrzymuje prosty, stabilny serwer i “prawa domeny” (allowlista, konflikty, transakcje).
- Agent ma wąskie uprawnienia: **planowanie i propozycje**.

### 5.3 Zakres filesystem tools

**Rekomendacja**:
- Filesystem tools w Agent SDK = **read-only lub read-mostly**.
- Zapis preferencyjnie przez domenowe endpointy backendu (`/api/apply`, `/api/file/save`, `/api/task/move`).

Powód: agentowe “write_file” łatwo rozjeżdża format i trudniej walidować intencję.

---

## 6) Bezpieczeństwo (threat model)

### 6.1 Granice zaufania
- UI i użytkownik: zaufany, ale nadal wymaga autoryzacji (telefon = publiczny internet).
- Agent: **niezaufany wykonawczo** (może popełniać błędy) → musi działać w sandboxie.

### 6.2 Autoryzacja
- Minimalnie: jeden token API (np. header `Authorization: Bearer …`).
- Alternatywnie Basic Auth + HTTPS.
- Docelowo: prosta sesja + CSRF (jeśli browser-based auth).

### 6.3 Allowlista ścieżek
- Backend dopuszcza tylko ścieżki z listy GTD:
  - `inbox.md`, `waiting-for.md`, `someday-maybe.md`, `areas/`, `lists/`, `projects/`, `daily plans/`, `system/` (opcjonalnie)
- Backend zabrania `..` i symlink escape.

### 6.4 Ograniczenia operacji
- Zapis do plików tylko `.md` (opcjonalnie `.html` dla UI, ale lepiej nie).
- Zakaz usuwania katalogów/plików przez API.
- Przenoszenie tasków = kontrolowana operacja (nie „dowolny patch”).

### 6.5 Rate limiting
- `/api/agent/*` limit (np. 10 req/min) + debouncing w UI.

---

## 7) API (kontrakty)

### 7.1 Tasks

#### `GET /api/tasks`
Parametry:
- `sources[]` (powtarzalny): lista źródeł (pliki lub foldery)
- `checked`: `true|false|all`
- `search`: string
- (opcjonalnie) `tags[]`, `contexts[]`, `types[]`

Odpowiedź:
- `tasks[]` (jak w §3.4)
- `sources_resolved[]` (jak serwer rozwinął foldery)
- `total`

#### `POST /api/apply`
Jak obecnie: lista zmian liniowych (toggle checkbox) oparta o `original_line`.

### 7.2 Files

#### `GET /api/file?path=...`
Zwraca:
- `path`
- `etag`
- `front_matter` (obiekt)
- `content` (cały tekst)

#### `POST /api/file/save`
Body:
- `path`
- `expected_etag`
- `content` (cały tekst) **albo** `patch` (preferowane w przyszłości)

### 7.3 Agent

#### `POST /api/agent/query`
Body:
- `text`: polecenie w NL
- `ui_state` (opcjonalnie): aktualne filtry, otwarty plik, widok, itp.

Odpowiedź:
- `assistant_message`: co pokazać w chacie
- `ui_actions[]`: lista akcji (patrz §8)
- `view` (opcjonalnie): specyfikacja filtrów/źródeł
- `draft_changes` (opcjonalnie): lista zmian do zaakceptowania

**Zasada**: agent nie wykonuje destrukcyjnych operacji bezpośrednio; zwraca `draft_changes`, a UI oferuje „Zastosuj”.

---

## 8) Protokół “Agent → UI” (UI Actions)

### 8.1 Struktura

```json
{
  "assistant_message": "OK — pokazuję niezrobione z Telefon + Inbox.",
  "ui_actions": [
    {"type": "set_view", "view": {"sources": ["lists/Telefon.md", "inbox.md"], "checked": "false", "search": ""}},
    {"type": "open_panel", "panel": "tasks"},
    {"type": "toast", "kind": "info", "text": "Widok ustawiony"}
  ]
}
```

### 8.2 Lista akcji (minimalny zestaw)
- `set_view`: ustawia źródła + filtry (tasks)
- `open_file`: otwiera plik w panelu plików
- `highlight`: podświetla task lub sekcję
- `draft_changes`: podaje propozycje zmian (UI pokazuje diff/preview)
- `apply_changes`: (opcjonalnie) UI może wykonać automatycznie, ale domyślnie tylko po akceptacji
- `toast`: komunikat
- `open_panel`: przełącza zakładkę (tasks/files/chat)

**Ważne**: UI Actions nie mają dostępu do DOM; UI mapuje je na własny stan.

---

## 9) UX / UI: podwójny interfejs

### 9.1 Układ (desktop)
- Lewa kolumna: Sources (lista plików/list/projektów, zapisane views)
- Środek: Tasks (agregacja + filtry + grupowanie po pliku/nagłówkach)
- Prawa kolumna: Chat (historia + input + quick actions)

### 9.2 Układ (mobile)
- Dolne zakładki: **Tasks | Files | Chat**
- Chat może mieć szybkie przyciski: „Pokaż dzisiaj”, „Inbox”, „Telefon”, „Szukaj…”.

### 9.3 Klasyczny UI (Tasks)
- Filtry: `sources` (multi-select), `checked`, `search`.
- Grupowanie: per plik + (opcjonalnie) per heading.
- Odhaczanie: jak dziś, z “pending changes” i przyciskiem “Zapisz”.

### 9.4 UI plików (Files)
- Lista/quick open + wyszukiwarka nazw.
- Podgląd markdown (plain text lub render).
- Edycja: textarea + “Zapisz” (z `etag`).
- Dodatkowo: przycisk “Poproś agenta o pomoc z tym plikiem” (chat z kontekstem otwartego pliku).

### 9.5 Chat
- Każda odpowiedź agenta może:
  - ustawić widok,
  - otworzyć plik,
  - zaproponować zmiany,
  - wyjaśnić co zrobił i dlaczego.

---

## 10) Intencje języka naturalnego (NL → intents)

Minimalny zestaw intencji:
- `show_tasks`: „pokaż niezrobione z …”, „pokaż dziś”, „pokaż zakupy”
- `open_file`: „otwórz plik …”, „pokaż listę IKEA”
- `search`: „znajdź …”
- `toggle_task`: „odhacz …” (zawsze jako draft)
- `add_task`: „dodaj do inbox: …” (draft)
- `move_task`: „przenieś … do …” (draft)

Mapowanie do źródeł:
- Agent używa:
  - front matter `title` i `aliases`
  - nazwy plików
  - indeksu sources z backendu

---

## 11) Indeksowanie (wydajność)

Wersja 1 (prosta):
- Skan repo przy każdym `/api/tasks` (jak dziś) — OK dla małej skali.

Wersja 2 (optymalizacja):
- Cache: `file -> {etag, tasks, front_matter}`
- Inwalidacja po zapisie.

Wersja 3 (docelowa):
- In-memory index + periodic refresh.

---

## 12) Plan wdrożenia (iteracyjny)

### Iteracja 0: Porządek i kompatybilność
- Ujednolicić start serwera (host/port).
- Zachować obecne `/api/tasks` i `/api/apply`.

### Iteracja 1: Sources multi-select + open file
- `/api/file` (read)
- `/api/tasks` z `sources[]`
- UI: multi-select źródeł + panel Files

### Iteracja 2: Front matter
- Parse front matter + `doc` w taskach
- Ignorowanie front matter w task scan
- UI: pokazuj `doc.title` i `doc.type`

### Iteracja 3: Chat (bez agenta)
- UI panel chat (lokalnie log, bez LLM) — przygotowanie UX.

### Iteracja 4: Agent query (Claude Agent SDK)
- Node sidecar + Agent SDK
- `POST /api/agent/query`
- UI: chat wysyła polecenia, agent ustawia widok / otwiera pliki

### Iteracja 5: Edycje przez agenta (draft)
- `draft_changes` dla toggle/add/move
- UI: preview + accept

---

## 13) Checklisty jakości

- Spójność danych: żadna operacja nie “zgaduje” ścieżek poza allowlistą.
- Konflikty: zapisy bronią się `original_line`/`etag`.
- UX: agent zawsze tłumaczy „co ustawił / co proponuje zmienić”.
- Offline/latency: UI działa bez agenta (agent jest dodatkiem).

---

## 14) Otwarte decyzje

1) Czy `system/` jest częścią allowlisty do edycji przez UI/agent?
2) Czy widoki (`type: view`) trzymamy w `system/views/*.md`, czy gdzie indziej?
3) Czy edycja pliku w UI ma być pełna, czy tylko “bezpieczne operacje” (add/move/toggle)?
4) Jak mocno normalizujemy markdown (np. porządek sekcji, format list)?

---

## 15) Przykłady poleceń (telefon)

- „Pokaż mi dzisiaj i Telefon” → `set_view(sources=[daily today, lists/Telefon.md], checked=false)`
- „Otwórz IKEA” → `open_file(lists/IKEA.md)`
- „Znajdź Luxmed” → `set_view(search="luxmed")`
- „Dodaj do inbox: zadzwonić do mamy” → `draft_changes(add_task inbox)`
- „Przenieś ‘Odbiór paczki Zofki’ do Telefon” → `draft_changes(move_task …)`
