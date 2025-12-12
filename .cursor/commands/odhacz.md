# /odhacz — Interfejs do odhaczania zadań

Szybki interfejs do przeglądania i odhaczania zadań z checkboxami.

## Workflow

### Krok 1: Użytkownik mówi co chce zobaczyć

Przykłady:
- "Pokaż IKEA" → `lists/IKEA.md`
- "Co mam na mieście" → `lists/Na mieście.md`
- "Daily plan na dziś" → `daily plans/YYYY-MM-DD.md`
- "Wszystko z projektów" → `projects/`
- "IKEA i Leroy" → `lists/IKEA.md lists/Leroy\ Merlin.md`

### Krok 2: Agent generuje dane

Uruchom skrypt `generate.py` z odpowiednimi ścieżkami:

```bash
cd /Users/higher/Documents/todo
python3 .cursor/commands/odhacz/generate.py <ścieżki>
```

Przykłady:
```bash
# Jeden plik
python3 .cursor/commands/odhacz/generate.py lists/IKEA.md

# Katalog (rekursywnie)
python3 .cursor/commands/odhacz/generate.py "daily plans/"

# Wiele plików/katalogów
python3 .cursor/commands/odhacz/generate.py lists/IKEA.md areas/Dom.md projects/

# Glob pattern
python3 .cursor/commands/odhacz/generate.py "lists/*.md"
```

Skrypt wypisze ile zadań znalazł i wygeneruje `data.js`.

### Krok 3: Upewnij się że serwer działa

Jeśli nie działa, uruchom:
```bash
cd /Users/higher/Documents/todo/.cursor/commands/odhacz
python3 -m http.server 9999 &
```

### Krok 4: Otwórz UI w przeglądarce

```
browser_navigate: http://localhost:9999/template.html
```

Powiedz użytkownikowi ile zadań jest wyświetlonych i z jakich plików.

### Krok 5: Użytkownik klika checkboxy

Agent czeka. Użytkownik przegląda listę, klika co chce.

### Krok 6: Użytkownik mówi "gotowe" / "zapisz"

### Krok 7: Agent odczytuje stan i aktualizuje markdowny

1. Zrób `browser_snapshot`
2. Znajdź wszystkie elementy `.task[data-checked]`:
   - Sprawdź atrybut `data-checked` ("1" = zaznaczony, "0" = niezaznaczony)
   - Porównaj z oryginalnym stanem (w `data.js`)
3. Dla zmienionych: edytuj odpowiedni plik markdown:
   - `- [ ]` → `- [x]` (odhaczenie)
   - `- [x]` → `- [ ]` (odznaczenie)
4. Podsumuj co zostało zmienione

## Pliki

- `template.html` — statyczny UI (nie ruszać)
- `ui.js` — logika renderowania (nie ruszać)  
- `generate.py` — **skrypt generujący data.js**
- `data.js` — dane (generowane przez skrypt)

## Przykład sesji

```
Użytkownik: /odhacz pokaż mi listę IKEA i Na mieście

Agent: [Uruchamia] python3 generate.py lists/IKEA.md "lists/Na mieście.md"
Agent: [Output] ✓ lists/IKEA.md: 8 zadań
              ✓ lists/Na mieście.md: 10 zadań
              📄 Wygenerowano data.js: 18 zadań z 2 plików

Agent: [Otwiera przeglądarkę]
Agent: Masz 18 zadań z IKEA i Na mieście. Klikaj, jak skończysz powiedz "gotowe".

Użytkownik: gotowe

Agent: [Robi snapshot, parsuje zmiany]
Agent: [Aktualizuje pliki]
Agent: ✅ Zapisano zmiany:
  - lists/IKEA.md L3: Szczotka do kibla → odhaczone
  - lists/Na mieście.md L8: Odebrać pranie → odhaczone
```
