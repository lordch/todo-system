# `/praca-nad-zadaniem` — Rozpoczęcie pracy nad zadaniem

## Cel

Komenda służy do rozpoczęcia pracy nad konkretnym zadaniem, które wymaga szczegółów, notatek lub śledzenia postępów. Tworzy dedykowany plik zadania w folderze `zadania/` i linkuje go z oryginalnym źródłem (lista/projekt/daily plan).

## Kiedy używać

- Zadanie wymaga szczegółowych notatek podczas pracy
- Zadanie ma podzadania do śledzenia osobno
- Chcesz notować postępy, odkrycia, problemy podczas wykonywania
- Zadanie jest złożone, ale nie jest projektem (nie ma jednego "rezultatu końcowego")
- Zadanie jest "w trakcie" i potrzebujesz miejsca na kontekst

## Workflow

### Krok 1: Wybór zadania
Agent pyta:
- "Które zadanie? (podaj nazwę lub wskaż z listy/projektu/daily plan)"

### Krok 2: Lokalizacja źródła
Agent znajduje zadanie w systemie:
- Przeszukuje `lists/`, `projects/`, `daily plans/`
- Jeśli nie znajdzie → pyta o dokładną lokalizację

### Krok 3: Tworzenie pliku zadania
Agent:
1. Tworzy plik w `zadania/[nazwa-zadania].md` (sanitizowana nazwa)
2. Jeśli plik już istnieje → otwiera istniejący i pyta czy kontynuować
3. Wypełnia szablon z:
   - Linkiem do źródła
   - Kontekstem zadania
   - Statusem: 🟢 W trakcie
   - Sekcją "Postęp" (jeśli zadanie ma podzadania)
   - Sekcją "Notatki z pracy"

### Krok 4: Aktualizacja źródła (opcjonalnie)
Agent pyta:
- "Czy oznaczyć zadanie jako 'w trakcie' na liście źródłowej?"
  - Jeśli TAK → dodaje oznaczenie 🔄 lub link do pliku zadania

### Krok 5: Gotowe do pracy
Agent otwiera plik zadania i potwierdza:
- "Plik zadania utworzony: `zadania/[nazwa].md`"
- "Możesz teraz notować postępy i szczegóły podczas pracy"

## Format pliku zadania

```markdown
# [Nazwa zadania]

## Status
🟢 W trakcie

## Źródło
- **Lista:** [Telefon.md](lists/Telefon.md)
- **Zadanie:** `- [ ] Uszczelki do lodówki Amica BK316BUW+04AT (BK3165.4)`
- **Utworzone:** 2025-12-08

## Kontekst
[Opcjonalne: dlaczego to zadanie, tło, ważne informacje]

## Postęp
- [x] Sprawdzić jak działają uszczelki (osobne dla lodówki i zamrażarki)
- [ ] Sprawdzić oryginalne części Amica (sklep producenta/serwis)
- [ ] Sprawdzić opcje uniwersalne: Allegro, vani.pl, gastrouszczelki.pl
- [ ] Zmierzyć wymiary obecnych uszczelek
- [ ] Zamówić uszczelki do lodówki i zamrażarki

## Notatki z pracy
_[Tutaj notuj odkrycia, problemy, linki, ceny, decyzje podczas pracy]_

## Następna akcja
- [ ] [Konkretna następna akcja do wykonania]
```

## Statusy zadań

- 🟢 **W trakcie** — aktywnie nad tym pracujesz
- ⏸️ **Wstrzymane** — czekasz na coś lub odłożyłeś na później
- ✅ **Zakończone** — zadanie wykonane (można przenieść do archiwum)

## Przykłady użycia

### Przykład 1: Zadanie z listy
```
Użytkownik: /praca-nad-zadaniem
Agent: Które zadanie?
Użytkownik: Uszczelki do lodówki z listy Telefon
Agent: [Znajduje zadanie] Tworzę plik zadania...
Agent: Plik utworzony: zadania/Uszczelki-do-lodówki.md
Agent: Czy oznaczyć zadanie jako 'w trakcie' na liście Telefon?
```

### Przykład 2: Zadanie z projektu
```
Użytkownik: /praca-nad-zadaniem
Agent: Które zadanie?
Użytkownik: Naprawić bug z logowaniem z projektu Lawly
Agent: [Znajduje w projekcie] Tworzę plik zadania...
```

### Przykład 3: Zadanie już istnieje
```
Użytkownik: /praca-nad-zadaniem
Agent: Które zadanie?
Użytkownik: Instalacja piecyka
Agent: Plik zadania już istnieje: zadania/Instalacja-piecyka.md
Agent: Czy kontynuować pracę nad tym zadaniem?
```

## Integracja z systemem

### Linkowanie
- Plik zadania zawsze linkuje do źródła (lista/projekt/daily plan)
- Opcjonalnie: zadanie na liście może mieć link do pliku zadania

### Aktualizacja statusu
- Gdy zadanie jest zakończone → można oznaczyć ✅ i przenieść do archiwum
- Status zadania może być różny od statusu na liście (np. zadanie w trakcie, ale na liście nadal checkbox)

### Archiwum (przyszłość)
- Zakończone zadania można przenosić do `zadania/archiwum/` lub usuwać
- Decyzja użytkownika podczas zakończenia zadania

## Różnice: Zadanie vs Projekt

| Zadanie (`zadania/`) | Projekt (`projects/`) |
|---------------------|----------------------|
| Pojedyncze zadanie wymagające szczegółów | Wieloetapowe przedsięwzięcie |
| Nie ma jednego "rezultatu końcowego" | Ma zdefiniowany pożądany rezultat |
| Notatki z pracy, postępy | Plan, kroki, następna akcja |
| Przykład: "Uszczelki do lodówki" | Przykład: "Remont kuchni" |

## Pytania do użytkownika podczas komendy

1. **Które zadanie?** — identyfikacja zadania
2. **Czy oznaczyć jako 'w trakcie' na liście?** — opcjonalne oznaczenie
3. **Czy dodać kontekst?** — jeśli zadanie wymaga dodatkowych informacji
4. **Czy kontynuować istniejące zadanie?** — jeśli plik już istnieje

## Uwagi implementacyjne

- Nazwa pliku: sanitizowana (bez znaków specjalnych, spacje na myślniki)
- Unikalność: jeśli zadanie o takiej nazwie już istnieje → pytać czy kontynuować
- Backup: przed edycją istniejącego pliku można zapytać czy zrobić backup
- Automatyczne linkowanie: agent może automatycznie dodać link do pliku zadania w źródle (opcjonalnie)

