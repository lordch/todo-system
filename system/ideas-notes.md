# Pomysły na rozwój systemu

## ✅ Zaimplementowane

### Instrukcja: Planowanie dnia

#### Krok 1: Review wczorajszego dnia

- Otworzyć plan z wczoraj (`daily plans/YYYY-MM-DD.md`)
- Pozamykać wykonane zadania (oznaczyć `[x]`)
- Przenieść niewykonane zadania:
  - Do dzisiejszego planu
  - Do odpowiedniej listy kontekstowej
  - Do `someday-maybe.md` jeśli straciło priorytet

#### Krok 2: Pytania od agenta przy tworzeniu planu dnia

1. **Konkretne punkty czasowe**
   - Spotkania (godzina + nazwa)
   - Odebranie Mikiego
   - Zajęcia
   - Inne ustalone wydarzenia

2. **Priorytety na dzień**
   - Co jest najważniejsze?
   - Co musi zostać zrobione dzisiaj?
   - Jakie są cele dnia?

3. **Plany żywieniowe**
   - Kiedy planuję zjeść który posiłek?
   - Gdzie będą spożyte posiłki?
   - Czy mam jedzenie dla Mikiego?
   - Jak planuję je zdobyć? (zakupy, zamówienie, przygotowanie)

#### Efekt

Plik w `daily plans/YYYY-MM-DD.md` zawierający:
- Harmonogram z konkretnymi godzinami
- Sekcję z priorytetami
- Plan żywieniowy (dla siebie i Mikiego)
- Wolne okna czasowe do wypełnienia zadaniami

---

## 💡 Pomysły do rozważenia

### Blokery: dwukierunkowe linkowanie

**Problem:** Gdy task A blokuje task B, po zamknięciu A nie wiadomo że B jest odblokowane.

**Pomysł:**
- Przy tasku dodawać linki do blokerów
- Po zakończeniu taska agent sprawdza co było blokowane
- Sekcja `## Blokuje` w taskach (oprócz `## Blokery`)

**Status:** Do zaprojektowania

---

### Komenda `/midday-review`

**Problem:** Brak check-inu w ciągu dnia - czy jesteśmy on track?

**Pomysł:**
1. Przeczytaj dzisiejszy daily plan
2. Zapytaj: "Co zrobiłeś do tej pory?"
3. Porównaj z harmonogramem
4. Zaproponuj korektę reszty dnia

**Status:** Do zaprojektowania

---

### Rytuał: 10 min na zablokowane

**Problem:** Zadania z blokerem emocjonalnym (🔴) leżą w nieskończoność.

**Pomysł:** Codzienny nawyk - spędź 10 min nad czymś w czym jesteś zablokowany przez siebie. Nie robić, tylko **siedzieć z tym**.

**Status:** Do włączenia w folder `nawyki/`

---

### Plan żywieniowy - osobny dokument

**Problem:** Plan żywieniowy w daily plan jest ok, ale brakuje:
- Trackowania zakupów
- Planowania na tydzień
- Powiązania z listą zakupów

**Pomysł:** Oddzielny dokument trackujący posiłki, planowane miejsce i zakupy.

**Status:** Do zaprojektowania

---

### Folder `nawyki/` + index

**Problem:** Nawyki ≠ taski (nie da się ich "zamknąć"). Potrzebują osobnej struktury.

**Pomysł:**
```
nawyki/
  index.md          # Lista nawyków z ich "regułami"
  bieganie.md       # Refleksje, historia, problemy z tym nawykiem
  medytacja.md
```

Przy `/plan-dnia` agent czyta `nawyki/index.md` i pyta:
- "Bieganie: cel 3x/tyg. Kiedy w tym tygodniu planujesz?"
- "Medytacja: cel codziennie. O której dzisiaj?"

**Status:** Do zaprojektowania

---

### Rozdzielenie: konteksty vs osoby vs listy

**Problem:** Wszystko w `lists/` jest pomieszane - konteksty, osoby, sklepy, tematy.

**Pomysł:** Rozdzielić na foldery z własnymi indeksami:
```
konteksty/
  index.md
  telefon.md
  komputer.md
  na-miescie.md

osoby/
  index.md
  ruslan.md
  miki.md

listy/               # custom/tematyczne
  index.md
  ikea.md
  leroy-merlin.md
```

**Status:** Do przemyślenia - czy warto zwiększać complexity?

---

### Indeksy - progressive disclosure

**Problem:** Jak zapewnić propagację zmian "w górę" do indeksów?

**Pomysł:** Indeks nie listuje tasków, tylko:
- Ogólny obraz (co to za kategoria)
- Kategoryzację itemów (podział na typy)
- Linki do szczegółów

**Opcje propagacji:**
1. Agent automatycznie aktualizuje index przy tworzeniu pliku
2. Komenda `/sync-indexes` - skanuje foldery
3. Index generowany dynamicznie przez agenta

**Status:** Do zaprojektowania

---

### Next action vs Blocked - lepsze rozróżnienie

**Problem:** W listach mieszają się zadania gotowe do wzięcia i zablokowane.

**Pomysł:** Sekcje w listach:
```markdown
## 🟢 Ready (następne akcje)
- [ ] Napisać maila do X

## 🔴 Blocked (wymaga czegoś)
- [ ] Wrzucić PR → blokowane przez: brak clarity
```

**Status:** Do przemyślenia

---

### Interfejs do odhaczania zadań

**Problem:** Markdown jest świetny do dodawania zadań (szybkie, tekstowe, elastyczne), ale odhaczanie zadań przez edycję `[ ]` na `[x]` w plikach tekstowych nie jest sustainable. To jest fundamentalne ograniczenie koncepcji markdown jako idealnego interfejsu do wszystkich operacji.

**Obserwacja:** 
- ✅ Dodawanie tekstowe = spoko (wręcz super)
- ❌ Odhaczanie tekstowe = nienienie

**Pytania do rozważenia:**
- Czy potrzebny jest dedykowany interfejs (UI) do odhaczania, zachowując markdown jako backend?
- Czy możliwe jest lepsze wsparcie w edytorze (np. skróty klawiszowe, łatwe przełączanie checkboxów)?
- Czy można stworzyć hybrydowy system: markdown do dodawania/edytowania, ale prosty UI do szybkiego odhaczania?

**Status:** Do zaprojektowania - priorytet: WYSOKI (dotyka core workflow)

---

## 📊 Priorytety rozwoju

| Obszar | Pomysł | Złożoność | Wartość |
|--------|--------|-----------|---------|
| Komendy | `/midday-review` | Niska | Wysoka |
| Nawyki | Folder z logiką reguł | Średnia | Wysoka |
| Blokery | Dwukierunkowe linkowanie | Wysoka | Średnia |
| Struktura | Rozdzielenie konteksty/osoby/listy | Średnia | Średnia |
| Indeksy | Progressive disclosure + propagacja | Wysoka | Średnia |
| Żywienie | Osobny dokument | Niska | Niska |
| Interfejs | UI do odhaczania zadań | Wysoka | WYSOKA |

---

_Ostatnia aktualizacja: 2025-12-12_




