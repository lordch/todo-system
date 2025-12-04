# `/save` — Zapisywanie zmian w git (add, commit, push)

## Cel

Komenda służy do szybkiego zapisania wszystkich zmian w repozytorium git. Automatycznie wykonuje `git add .`, `git commit` z podanym komunikatem i `git push`.

## Kiedy używać

- Po zakończeniu sesji pracy nad zadaniami
- Gdy chcesz zapisać zmiany przed przełączeniem kontekstu
- Po wprowadzeniu znaczących zmian w systemie
- Przed zamknięciem edytora/projektu

## Workflow

### Krok 1: Pytanie o commit message

Agent pyta:
- "Jaki komunikat commit? (lub zostaw puste dla 'Update')"

### Krok 2: Wykonanie komend git

Agent wykonuje kolejno:

1. `git add .` - dodanie wszystkich zmian
2. `git commit -m "[message]"` - commit z podanym komunikatem (lub "Update" jeśli puste)
3. `git push` - push do zdalnego repozytorium

### Krok 3: Potwierdzenie

Agent wyświetla wynik każdej komendy i potwierdza sukces lub informuje o błędach.

## Format danych

Komenda używa standardowych komend git:
- Commit message: dowolny tekst (może być pusty, wtedy używa "Update")

## Przykłady użycia

### Przykład 1: Z komunikatem
```
Użytkownik: /save
Agent: Jaki komunikat commit? (lub zostaw puste dla 'Update')
Użytkownik: Dodano komendę /save
Agent: [Wykonuje git add ., git commit -m "Dodano komendę /save", git push]
Agent: ✅ Zmiany zapisane i wypushowane
```

### Przykład 2: Bez komunikatu
```
Użytkownik: /save
Agent: Jaki komunikat commit? (lub zostaw puste dla 'Update')
Użytkownik: [pusty]
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
- Domyślny commit message: "Update" jeśli użytkownik nie poda żadnego
- Agent wyświetla output każdej komendy git dla przejrzystości

