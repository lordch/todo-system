# Przetwarzanie Inbox

Przeprowadź użytkownika przez przetwarzanie `inbox.md` — cel to pusty inbox.

## Zasady procesu

**Framework myślowy** (dla agenta, nie do recytowania):
1. Co to jest? (pytaj tylko gdy niejasne)
2. Czy actionable? (usuń śmieci, przenieś do someday/maybe jeśli nie)
3. Następna akcja? (konkretna, fizyczna)
4. Projekt czy pojedyncza akcja?
5. Gdzie to przypisać?

**Nie pytaj o oczywiste rzeczy** — jeśli z kontekstu wiadomo:
- Że coś jest actionable → nie pytaj, przejdź dalej
- Że zajmie >2 min → nie pytaj, przypisz do listy
- Na jaką listę pasuje → zaproponuj od razu
- Że to pojedyncza akcja → dodaj do listy

**Pytaj tylko gdy:**
- Opis niejasny (co użytkownik ma na myśli?)
- Nie wiesz na którą listę przypisać
- Nie wiesz czy to projekt czy akcja
- Jest istotna decyzja do podjęcia

## Styl komunikacji

**✅ Dobrze:**
```
Widzę 5 elementów w inbox:
1. "Odebrać szafkę z Międzylesia" 
2. "Zapisać się do Giglike'a"
3-5. Trzy rzeczy związane z IKEA

Zacznijmy od #1 - skąd ta szafka, jest jakiś deadline?
```

**❌ Źle:**
```
Element 1: "Odebrać szafkę z Międzylesia"

1. Co to jest?
Wyjaśnij proszę...

2. Czy to jest actionable?
Jeśli tak, przejdźmy dalej...

3. Jaka jest następna akcja?
- Czy zajmie mniej niż 2 minuty?
- Czy możesz to zlecić?
```

## Batch processing

**Grupuj proste elementy:**
- Kilka zakupów → wszystkie do odpowiednich list zakupowych
- Kilka spraw "na mieście" → wszystkie na jedną listę
- Kilka rzeczy do omówienia z osobą X → wszystkie do `Osoba X.md`

**Przykład:**
```
Elementy 3-5 to zakupy - dodam je wszystkie do IKEA.md:
- Sztucce
- Śmietnik  
- Wieszaczki na ścierki

Ok?
```

## Clarity check (tylko gdy potrzebne)

Jeśli element jest niejasny/przytłaczający/zablokowany:
- Pomóż sformułować konkretną następną akcję
- Zapytaj czy użytkownik wie JAK to zrobić
- Jeśli nie wie jak → pierwsza akcja to research
- Jeśli projekt jest duży/niejasny → zasugeruj `/rozłóż`

## Decyzje o projekcie vs akcja

**Projekt = cokolwiek wymagające więcej niż jednej akcji**

**Pojedyncza akcja:**
- Przenieś do odpowiedniej kolekcji w `lists/`
- Format: `- [ ] [Czasownik] [konkretny rezultat]`

**Projekt:**
1. Stwórz plik projektu w `projects/[nazwa].md` zawierający:
   - Status (🟢 jasny / 🟡 niejasny / 🔴 zablokowany)
   - Pożądany rezultat
   - Blokery (jeśli są)
   - Lista kroków (brain dump)
   - **Następną akcję** (konkretną, wykonalną)
2. Dodaj projekt do `index.md`
3. Dodaj następną akcję do odpowiedniej listy kontekstowej

## Wykonanie

1. Przeczytaj cały inbox i zobacz co tam jest
2. Przetwarzaj od góry, grupując podobne elementy gdy ma to sens
3. Proponuj konkretne akcje, pytaj tylko o niuanse
4. Po każdym elemencie usuwaj go z inbox
5. Cel: pusty inbox

---

**Pamiętaj:** Pytania z frameworku to **narzędzie myślenia**, nie skrypt do odczytania. Komunikuj się naturalnie, jak partner który pomaga ogarnąć listę zadań.

