# System statusów i oznaczeń

Używamy emoji i markerów do szybkiego oznaczania jasności i blokerów w zadaniach i projektach.

## Statusy projektów

Każdy projekt w `projects/` powinien mieć status na początku:

### 🟢 Jasny (Clear)
- Wiem dokładnie co robić
- Mam zdefiniowaną następną akcję
- Brak blokerów
- Mogę zacząć pracę w każdej chwili

**Przykład:**
```markdown
# Projekt X

## Status: 🟢 Jasny

## Następna akcja
- [ ] Napisać testy dla funkcji Y (30 min)
```

### 🟡 Niejasny (Unclear)
- Wymaga research/przemyślenia
- Nie wiem JAK to zrobić
- Brak jasnych wymagań
- Potrzeba więcej informacji

**Akcja:** Użyj `/rozłóż` lub zaplanuj sesję planowania

**Przykład:**
```markdown
# Projekt X

## Status: 🟡 Niejasny - wymaga research

## Blokery
- Nie wiem jak zintegrować bibliotekę Z
- Niejasne wymagania od klienta

## Następna akcja
- [ ] Przeczytać dokumentację biblioteki Z (research, 1h)
```

### 🔴 Zablokowany (Blocked)
- Blokada emocjonalna (strach/prokrastynacja/perfekcjonizm)
- Blokada techniczna (bug/brak dostępu)
- Blokada zewnętrzna (czekam na kogoś)
- Przytłoczenie rozmiarem zadania

**Akcja:** Użyj `/rozłóż` żeby przebić blokadę

**Przykład:**
```markdown
# Projekt X

## Status: 🔴 Zablokowany emocjonalnie

## Blokery
- [ ] Strach przed komentarzami od code review
- [ ] Brak kontekstu (2 tygodnie przerwy)
- [ ] Przytłoczenie ilością zmian

## Następna akcja
- [ ] Otworzyć projekt i przeczytać ostatni commit (5 min, żeby wrócić do kontekstu)
```

---

## Oznaczenia dla zadań

### W listach (`lists/`) i daily plans

**Jasne zadanie** - bez oznaczenia:
```markdown
- [ ] Zmierzyć szerokość drzwi wejściowych
- [ ] Napisać maila do Jana z propozycją spotkania
- [ ] Przeczytać dokumentację API endpoints
```

**Niejasne zadanie** - wymaga rozłożenia:
```markdown
- [ ] ⚠️ Ogarnąć kuchnię (wymaga rozłożenia)
- [ ] ⚠️ Dokończyć feature X (co dokładnie?)
```

**Zadanie z blokerem**:
```markdown
- [ ] 🔴 Wrzucić PR (blokada: strach przed komentarzami)
- [ ] 🟡 Zintegrować API (blokada: brak dokumentacji)
- [ ] ⏸️ Wdrożyć zmiany (czekam na: dostęp do serwera)
```

**Zadanie typu research** (gdy nie wiem JAK):
```markdown
- [ ] 📚 Znaleźć jak zrobić X w React
- [ ] 📚 Zapytać Romana o proces deployment
```

---

## Czasowniki - jasne vs niejasne

### ❌ Niejasne (unikaj tych):
- "Ogarnąć..."
- "Zająć się..."
- "Dokończyć..." (bez kontekstu)
- "Poprawić..." (bez konkretów)
- "Pomyśleć o..."

**Akcja:** Jeśli widzisz taki czasownik → zapytaj "Co konkretnie?"

### ✅ Jasne (używaj tych):
- "Napisać..."
- "Przeczytać..."
- "Zmierzyć..."
- "Zapytać [kogo] o..."
- "Zainstalować..."
- "Przetestować..."
- "Usunąć..."
- "Dodać..."
- "Sprawdzić [co konkretnie]..."

---

## Kiedy używać jakich oznaczeń

### Podczas `/przetworz-inbox`
Agent pyta: "Czy ta akcja jest jasna?" i oznacza niejasne zadania ⚠️

### Podczas `/plan-dnia`
Agent pyta o każdy priorytet czy jest jasny, oznacza niejasne ⚠️ lub 🔴

### Podczas `/rozłóż`
Agent zmienia status projektu z 🔴/🟡 na 🟢 gdy akcja jest jasna

### Podczas tworzenia projektu
Agent zawsze dodaje status (domyślnie 🟡 jeśli nie ma następnej akcji)

---

## Przykład ewolucji zadania

**Początek (inbox):**
```markdown
- [ ] Zająć się profilem prawnika
```

**Po `/przetworz-inbox`:**
```markdown
- [ ] ⚠️ Dokończyć feature profilu prawnika (wymaga rozłożenia)
```

**Po `/rozłóż` → projekt:**
```markdown
# Lawly - Profil prawnika

## Status: 🔴 Zablokowany emocjonalnie

## Blokery
- Brak kontekstu (2 tyg przerwy)
- Strach przed komentarzami

## Następna akcja
- [ ] Otworzyć VS Code i przeczytać kod w PR #123 (15 min)
```

**Po wykonaniu pierwszej akcji:**
```markdown
# Lawly - Profil prawnika

## Status: 🟢 Jasny

## Następna akcja
- [ ] Sprawdzić komentarze w PR #123 i odpowiedzieć na pytania
```

---

## Zasada ogólna

**Cel:** Zawsze wiedzieć czy coś jest "gotowe do wzięcia" (🟢) czy "wymaga pracy przygotowawczej" (🟡/🔴/⚠️)

Przy ADHD kluczowe jest **nie próbować robić rzeczy niejasnych** - to prowadzi do prokrastynacji. Najpierw trzeba je **rozłożyć na jasne akcje**.

