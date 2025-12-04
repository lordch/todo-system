# `/save` — Zapisywanie zmian w git (add, commit, push)

## Cel

Komenda służy do szybkiego zapisania wszystkich zmian w repozytorium git. Automatycznie wykonuje `git add .`, `git commit` z podanym komunikatem i `git push`.

## Kiedy używać

- Po zakończeniu sesji pracy nad zadaniami
- Gdy chcesz zapisać zmiany przed przełączeniem kontekstu
- Po wprowadzeniu znaczących zmian w systemie
- Przed zamknięciem edytora/projektu

## Workflow

### Wariant 1: `/save` (standardowy)

#### Krok 1: Analiza zmian i propozycja commit message

Agent:
1. Sprawdza zmiany w repozytorium (`git status`)
2. Analizuje zmodyfikowane/usunięte/dodane pliki
3. **Proponuje commit message** na podstawie zmian (np. "Dodano komendę /save", "Aktualizacja daily plan", "Poprawki w projekcie Lawly")

Agent wyświetla:
- "Proponowany komunikat commit: [propozycja]"
- "Akceptujesz? (Enter = tak, lub podaj własny komunikat)"

#### Krok 2: Akceptacja lub edycja

- Jeśli użytkownik akceptuje (Enter lub "tak") → używa propozycji
- Jeśli użytkownik poda własny komunikat → używa podanego
- Jeśli użytkownik zostawi pusty → używa "Update"

#### Krok 3: Wykonanie komend git

Agent wykonuje kolejno:

1. `git add .` - dodanie wszystkich zmian
2. `git commit -m "[message]"` - commit z wybranym komunikatem
3. `git push` - push do zdalnego repozytorium

#### Krok 4: Potwierdzenie

Agent wyświetla wynik każdej komendy i potwierdza sukces lub informuje o błędach.

### Wariant 2: `/save quick` (szybki)

Agent wykonuje od razu bez pytań:

1. `git add .` - dodanie wszystkich zmian
2. `git commit -m "Update"` - commit z domyślnym komunikatem "Update"
3. `git push` - push do zdalnego repozytorium

Agent wyświetla wynik i potwierdza sukces.

## Format danych

Komenda używa standardowych komend git:
- Commit message: dowolny tekst (może być pusty, wtedy używa "Update")

## Przykłady użycia

### Przykład 1: Standardowy z propozycją
```
Użytkownik: /save
Agent: [Sprawdza zmiany...]
Agent: Proponowany komunikat commit: "Dodano komendę /save"
Agent: Akceptujesz? (Enter = tak, lub podaj własny komunikat)
Użytkownik: [Enter]
Agent: [Wykonuje git add ., git commit -m "Dodano komendę /save", git push]
Agent: ✅ Zmiany zapisane i wypushowane
```

### Przykład 2: Z własnym komunikatem
```
Użytkownik: /save
Agent: [Sprawdza zmiany...]
Agent: Proponowany komunikat commit: "Aktualizacja daily plan 2025-12-05"
Agent: Akceptujesz? (Enter = tak, lub podaj własny komunikat)
Użytkownik: Poprawki w planie dnia i dodanie linki do Mikiego
Agent: [Wykonuje git add ., git commit -m "Poprawki w planie dnia i dodanie linki do Mikiego", git push]
Agent: ✅ Zmiany zapisane i wypushowane
```

### Przykład 3: Quick (bez pytań)
```
Użytkownik: /save quick
Agent: [Wykonuje git add ., git commit -m "Update", git push]
Agent: ✅ Zmiany zapisane i wypushowane
```

## Integracja z systemem

- Komenda nie modyfikuje struktury systemu GTD
- Działa na poziomie repozytorium git
- Może być używana niezależnie od innych komend systemu

## Uwagi implementacyjne

- Przed wykonaniem `git push` agent sprawdza status (czy są zmiany do commitu)
- Jeśli nie ma zmian → informuje użytkownika i pomija operacje
- Jeśli wystąpi błąd (np. konflikt) → wyświetla komunikat błędu i zatrzymuje proces
- **Propozycja commit message:** Agent analizuje zmiany (nazwy plików, ścieżki) i proponuje sensowny komunikat:
  - Nowe pliki → "Dodano [nazwa/typ]"
  - Modyfikacje w projektach → "Aktualizacja projektu [nazwa]"
  - Modyfikacje w daily plans → "Aktualizacja daily plan [data]"
  - Modyfikacje w listach → "Aktualizacja listy [nazwa]"
  - Systemowe zmiany → "Aktualizacja systemu"
- **Quick mode:** Wariant `/save quick` pomija pytania i używa komunikatu "Update"
- Agent wyświetla output każdej komendy git dla przejrzystości

