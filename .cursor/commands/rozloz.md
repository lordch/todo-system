# Rozłożenie zadania na czynniki pierwsze

Użyj tego rytuału gdy czujesz blokadę, brak jasności lub przytłoczenie jakimś zadaniem/projektem.

## Cel

Przekształcić niejasne, przytłaczające zobowiązanie w konkretną, wykonalną akcję.

## Zasady

- Agent **nie podejmuje decyzji** - tylko zadaje pytania
- Cel to **jedna konkretna następna akcja**, nie cały plan
- Jeśli jest blokada emocjonalna - **nazywamy ją**, nie ignorujemy
- Wynik zapisujemy w odpowiednim miejscu (projekt/lista/daily plan)

---

## Proces

### Krok 1: Identyfikacja

**Zadaj pytanie:**
> "O czym chcesz porozmawiać? Podaj nazwę zadania/projektu lub opisz co Cię blokuje."

### Krok 2: Odkryj blokadę

**Zadaj pytania (jedno po drugim):**

1. **Co Cię blokuje w tym zadaniu?**
   - [ ] Nie wiem JAK to zrobić (brak wiedzy technicznej)
   - [ ] Nie wiem CO dokładnie zrobić (niejasne wymagania)
   - [ ] Przytłoczenie rozmiarem zadania (za duże)
   - [ ] Blokada emocjonalna (strach/prokrastynacja/perfekcjonizm)
   - [ ] Zewnętrzny blok (czekam na kogoś/coś)
   - [ ] Coś innego?

2. **Jaki jest pożądany rezultat?**
   - "Co musi być prawdą, żeby to było skończone?"
   - "Jak poznasz, że to jest zrobione?"

3. **Czy wiesz JAK to zrobić?**
   - **TAK** → Idź do kroku 3
   - **NIE** → Pierwsza akcja to research:
     - "Przeczytać dokumentację X"
     - "Zapytać Y o..."
     - "Znaleźć przykład Z"

### Krok 3: Najmniejszy pierwszy krok

**Zadaj pytania:**

1. **Co byłoby najmniejszym możliwym pierwszym krokiem?**
   - "Coś co zajmie 5-15 minut"
   - "Coś co 'ruszy lawinkę'"
   - "Coś co da Ci momentum"

2. **Czy ten krok jest konkretny?**
   - ❌ ZŁE: "Ogarnąć feature X"
   - ❌ ZŁE: "Zająć się projektem Y"
   - ✅ DOBRE: "Przeczytać kod w pliku X.tsx"
   - ✅ DOBRE: "Napisać listę 3 rzeczy do zrobienia w projekcie Y"
   - ✅ DOBRE: "Zmierzyć szerokość drzwi"

3. **Jeśli jest to projekt - czy ma więcej niż jeden krok?**
   - **TAK** → Zapisz jako projekt w `projects/[nazwa].md`
   - **NIE** → Zapisz na odpowiedniej liście w `lists/`

### Krok 4: Zapis i plan

**Wykonaj akcje:**

1. **Jeśli to projekt:**
   - Stwórz/zaktualizuj plik w `projects/`
   - Dodaj status emoji (🔴🟡🟢)
   - Zapisz blokery
   - Zapisz następną akcję
   - Dodaj następną akcję do odpowiedniej listy kontekstowej

2. **Jeśli to pojedyncze zadanie:**
   - Dodaj do odpowiedniej listy w `lists/`
   - Format: `- [ ] [Czasownik] [konkretny rezultat]`

3. **Opcjonalnie dodaj do daily plan:**
   - Zapytaj: "Czy chcesz to zaplanować na konkretny dzień?"
   - Jeśli tak - dodaj do `daily plans/YYYY-MM-DD.md`

### Krok 5: Podsumowanie

**Potwierdź z użytkownikiem:**
- "Następna akcja to: [AKCJA]"
- "Zapisałem to w: [LOKALIZACJA]"
- "Kiedy planujesz to zrobić?" (opcjonalnie)

---

## Przykład użycia

```
Użytkownik: "Muszę ogarnąć projekt Lawly ale ciągle odkładam"

Agent: "Co Cię blokuje w tym projekcie?"
Użytkownik: "Nie pamiętam co tam robiłem, mam niewypchnięte PR-y od 2 tyg"

Agent: "Jaki jest pożądany rezultat? Co chcesz osiągnąć?"
Użytkownik: "Wrzucić te PR-y i wrócić do normalnej pracy"

Agent: "Czy wiesz JAK to zrobić technicznie?"
Użytkownik: "Tak, muszę tylko przypomnieć sobie co tam jest"

Agent: "Co byłoby najmniejszym pierwszym krokiem? 5-15 minut?"
Użytkownik: "Otworzyć projekt i przeczytać kod w tych PR-ach"

Agent: "Czy to jest projekt (wiele kroków)?"
Użytkownik: "Tak"

Agent zapisuje w projects/Lawly.md:
---
Status: 🔴 Zablokowany emocjonalnie
Blokery: Brak kontekstu (2 tyg przerwy), strach przed komentarzami
Następna akcja: Otworzyć VS Code i przeczytać kod w PR-ach o profilu prawnika (15 min)
---

Agent: "Następna akcja to: Otworzyć VS Code i przeczytać kod w PR-ach.
Zapisałem projekt w projects/Lawly.md. Kiedy planujesz to zrobić?"
```

---

## Notatki

- Ten rytuał można używać **w trakcie innych rytuałów** (np. podczas przetwarzania inbox)
- Jeśli użytkownik ma ADHD - szczególnie ważne jest **nazywanie emocji** (strach, przytłoczenie) zamiast ich ignorowania
- Czasem wystarczy "brain dump" - spisać wszystkie myśli, potem wybrać pierwszą akcję
- Agent powinien być **cierpliwy** - czasem potrzeba kilku iteracji żeby dojść do prawdziwego blokera




