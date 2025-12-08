# Status Check

Szybki przegląd statusu projektów i list — przepytanie użytkownika co zostało zrobione, co jest aktualne, co wymaga aktualizacji.

## Krok 1: Przygotuj agendę

1. Przeczytaj `index.md` i zidentyfikuj:
   - Aktywne projekty (`projects/`)
   - Aktywne listy (`lists/`)

2. Przeczytaj zawartość każdego projektu i listy

3. Przedstaw agendę użytkownikowi:

```
## Agenda Status Check

### Projekty (X)
1. [Nazwa projektu] — [obecny status/emoji]
2. ...

### Listy (X)
1. [Nazwa listy] — [liczba otwartych zadań]
2. ...

Czy zaczynamy? Mogę też pominąć niektóre elementy jeśli chcesz.
```

4. Czekaj na akceptację. Użytkownik może:
   - Zaakceptować całość
   - Poprosić o pominięcie niektórych elementów
   - Zmienić kolejność

## Krok 2: Przepytaj z każdego elementu

### Dla projektów:

Pokaż obecny stan projektu i zadaj pytania:

```
## [Nazwa projektu]

**Obecny status:** [emoji] [opis]
**Następna akcja:** [jeśli zdefiniowana]
**Deadline:** [jeśli jest]

**Zadania:**
- [ ] Zadanie 1
- [ ] Zadanie 2
...

---

Pytania:
1. Czy status projektu jest aktualny? (🟢 jasny / 🟡 niejasny / 🔴 zablokowany)
2. Czy coś zostało zrobione? Co zamknąć?
3. Czy następna akcja jest aktualna?
4. Czy są nowe zadania do dodania?
```

### Dla list:

Pokaż zadania i zadaj pytania:

```
## [Nazwa listy]

**Otwarte zadania:**
- [ ] Zadanie 1
- [ ] Zadanie 2
...

---

Pytania:
1. Czy coś zostało zrobione? Co zamknąć?
2. Czy wszystkie zadania są nadal aktualne?
3. Czy są nowe zadania do dodania?
```

## Krok 3: Aktualizuj pliki

Po każdej odpowiedzi:
- Zamknij wykonane zadania `[x]`
- Usuń nieaktualne zadania (za zgodą)
- Dodaj nowe zadania
- Zaktualizuj status projektu (emoji)
- Zaktualizuj datę "Ostatnia aktualizacja" w projektach

## Krok 4: Podsumowanie

Na końcu pokaż podsumowanie:

```
## Podsumowanie Status Check

### Zmiany:
- [Projekt X] — status zmieniony na 🟢, zamknięte 2 zadania
- [Lista Y] — dodane 3 zadania, usunięte 1
...

### Projekty wymagające uwagi:
- [Projekt Z] — 🔴 zablokowany, brak następnej akcji
...
```

## Zasady

- **Jeden element na raz** — nie bombarduj użytkownika wszystkimi pytaniami naraz
- **Pokaż kontekst** — przed pytaniami pokaż obecny stan
- **Szybkie odpowiedzi** — użytkownik może odpowiedzieć krótko ("nic", "bez zmian", "zamknij 1 i 3")
- **Aktualizuj na bieżąco** — po każdej odpowiedzi zapisz zmiany do pliku
- **Pomiń puste/nieistotne** — jeśli lista ma 0 zadań lub projekt jest zamknięty, pomiń lub zapytaj czy usunąć

## Różnica od Weekly Review

| Status Check | Weekly Review |
|--------------|---------------|
| Szybki przegląd | Pełny przegląd systemu |
| Tylko projekty i listy | + inbox, daily plans, waiting-for, someday-maybe |
| Przepytanie ze statusu | + planowanie na tydzień |
| 10-15 minut | 30-60 minut |


