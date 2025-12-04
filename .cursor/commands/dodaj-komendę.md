# `/dodaj-komendę` — Tworzenie nowej komendy systemu

## Cel

Komenda służy do tworzenia nowej komendy w systemie GTD. Tworzy plik dokumentacji komendy w folderze `.cursor/commands/` zgodnie ze standardowym formatem.

## Kiedy używać

- Chcesz dodać nową komendę do systemu
- Chcesz rozszerzyć funkcjonalność systemu o nowy workflow
- Masz pomysł na nowy rytuał/proces, który warto zautomatyzować

## Workflow

### Krok 1: Nazwa komendy
Agent pyta:
- "Jaka nazwa komendy? (np. `/nazwa-komendy`)"

### Krok 2: Cel i kontekst
Agent pyta:
- "Jaki jest cel tej komendy? Co ma robić?"
- "Kiedy używać tej komendy?"

### Krok 3: Workflow
Agent pyta:
- "Jak ma wyglądać workflow? (krok po kroku)"
- "Jakie pytania agent ma zadawać użytkownikowi?"
- "Jakie akcje agent ma wykonywać?"

### Krok 4: Format danych
Agent pyta:
- "Jakie pliki/struktury danych komenda tworzy/modyfikuje?"
- "Jaki format mają mieć dane?"

### Krok 5: Integracja z systemem
Agent pyta:
- "Jak komenda integruje się z istniejącym systemem?"
- "Czy modyfikuje istniejące pliki? (index.md, listy, projekty)"
- "Czy wymaga nowych folderów/struktur?"

### Krok 6: Przykłady
Agent pyta:
- "Masz przykłady użycia komendy?"

### Krok 7: Propozycja dokumentacji
Agent:
1. Sprawdza czy komenda o takiej nazwie już istnieje
   - Jeśli istnieje → pyta czy nadpisać czy zmienić nazwę
2. Tworzy pełną propozycję dokumentacji komendy w formie markdown
3. Wyświetla propozycję użytkownikowi do przeglądu
4. Pyta: "Czy ta dokumentacja jest OK? Chcesz coś zmienić?"

### Krok 8: Akceptacja i tworzenie pliku
Agent:
1. Jeśli użytkownik zaakceptuje → tworzy plik w `.cursor/commands/[nazwa-komendy].md`
2. Jeśli użytkownik chce zmiany → wprowadza poprawki i ponownie proponuje
3. Po akceptacji potwierdza utworzenie pliku

## Format pliku komendy

```markdown
# `/[nazwa-komendy]` — [Krótki opis]

## Cel

[Opis celu komendy - co ma robić i dlaczego]

## Kiedy używać

- [Sytuacja 1]
- [Sytuacja 2]
- [Sytuacja 3]

## Workflow

### Krok 1: [Nazwa kroku]
Agent pyta:
- "[Pytanie do użytkownika]"

### Krok 2: [Nazwa kroku]
Agent:
1. [Akcja 1]
2. [Akcja 2]
3. [Akcja 3]

## Format danych

[Opis formatu plików/danych tworzonych/modyfikowanych przez komendę]

## Przykłady użycia

### Przykład 1: [Scenariusz]
```
Użytkownik: /[nazwa-komendy]
Agent: [Reakcja agenta]
Użytkownik: [Odpowiedź]
Agent: [Działanie]
```

## Integracja z systemem

- [Jak komenda integruje się z systemem]
- [Jakie pliki modyfikuje]
- [Jakie nowe struktury tworzy]

## Pytania do użytkownika podczas komendy

1. **[Pytanie 1]** — [cel pytania]
2. **[Pytanie 2]** — [cel pytania]

## Uwagi implementacyjne

- [Uwaga 1]
- [Uwaga 2]
```

## Przykłady użycia

### Przykład 1: Prosta komenda
```
Użytkownik: /dodaj-komendę
Agent: Jaka nazwa komendy?
Użytkownik: /zamknij-projekt
Agent: Jaki jest cel tej komendy?
Użytkownik: Zamykanie zakończonych projektów i przenoszenie do archiwum
Agent: [Zbiera informacje, proponuje dokumentację...]
Agent: Oto propozycja dokumentacji:
---
# `/zamknij-projekt` — Zamykanie zakończonych projektów
[... pełna dokumentacja ...]
---
Czy ta dokumentacja jest OK? Chcesz coś zmienić?
Użytkownik: OK
Agent: [Tworzy plik komendy...]
```

### Przykład 2: Złożona komenda
```
Użytkownik: /dodaj-komendę
Agent: Jaka nazwa komendy?
Użytkownik: /przegląd-tygodniowy
Agent: [Prowadzi przez wszystkie kroki, tworzy kompleksową dokumentację]
```

## Integracja z systemem

### Sprawdzanie konfliktów
- Agent sprawdza czy komenda o takiej nazwie już istnieje
- Jeśli istnieje → pyta czy nadpisać czy zmienić nazwę

### Aktualizacja dokumentacji
- Komenda może automatycznie aktualizować `index.md` lub `instructions/` jeśli to potrzebne
- Decyzja użytkownika

### Weryfikacja
- Agent weryfikuje czy workflow jest kompletny
- Pyta o brakujące elementy przed propozycją dokumentacji
- Proponuje pełną dokumentację przed zapisaniem pliku
- Wprowadza zmiany po akceptacji użytkownika

## Uwagi implementacyjne

- Nazwa pliku: sanitizowana (bez znaków specjalnych, spacje na myślniki, bez `/` na początku)
- Unikalność: jeśli komenda o takiej nazwie już istnieje → pytać czy nadpisać
- Szablon: zawsze używać standardowego szablonu dla spójności
- Weryfikacja: sprawdzać czy workflow jest kompletny przed zapisaniem

