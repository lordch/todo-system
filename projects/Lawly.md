# Lawly

## Status
**Ostatnia aktualizacja:** 2025-12-08  
**Stan:** 🔴 Zablokowany emocjonalnie / Wymaga rozpisania

### Obecna sytuacja
- Niedokończone PR-y (profil prawnika) leżące od ~2 tygodni
- Niepewność co do feedbacku/komentarzy (Roman)
- Potrzeba odświeżenia kontekstu projektu
- Brak clarity co do następnych kroków
- Duża praca emocjonalna do wykonania (blokada, prokrastynacja)
- **Plan działania:** Wziąć się za to jutro (2025-12-04)

---

## Kontekst projektu

### Co to za projekt?
**Lawly** - marketplace platforma łącząca klientów z prawnikami w Polsce.

**Struktura repo:**
- `/Users/higher/Projects/lawly/` - główny folder z dokumentacją i workspace
- `/Users/higher/Projects/lawly-be/` - Backend (Django 5.2, Django Ninja, PostgreSQL)
- `/Users/higher/Projects/lawly-fe/` - Frontend (Next.js, TypeScript)

**Tech stack:**
- Backend: Python 3.12, Django 5.2, Django Ninja (REST API), PostgreSQL 17, Poetry
- Frontend: Next.js, TypeScript, React

### PR-y o profilu prawnika (feature/US-081-profile-management)

**Branch:** `feature/US-081-profile-management` (w obu repo)

**Backend (lawly-be):**
- ✅ Refaktoryzacja autentykacji - wydzielenie `get_authenticated_lawyer()` do `lawyers/auth.py`
- ✅ Zmiany w `lawyers/api.py` - użycie nowej funkcji zamiast duplikacji kodu
- ✅ Nowy plik: `lawyers/auth.py` - helper do autentykacji prawników
- ✅ Nowy plik: `users/management/commands/create_test_users.py` (untracked)
- **Status:** Zmiany są staged/ready, tylko drobne modyfikacje

**Frontend (lawly-fe):**
- ✅ Drobne zmiany w `src/app/panel/profil/edit/page.tsx` (puste linie)
- ✅ Drobne zmiany w `src/components/lawyer/ProfileForm.tsx` (puste linie)
- **Status:** Zmiany są staged/ready, tylko drobne modyfikacje

**Funkcjonalność:**
- Endpointy do zarządzania profilem prawnika (`GET /me/profile/`, `POST /me/profile/`)
- Refaktoryzacja kodu autentykacji (DRY principle)
- Frontend do edycji profilu prawnika

**Ostatnie commity w BE:**
- `a971c62` - fix: Export get_my_profile function in services __init__
- `e1c04df` - feat: Add GET /me/profile/ endpoint for profile view (F-003)
- `a1af7ba` - feat: Add POST /me/profile/ endpoint for profile creation (F-002)
- `5432372` - feat: Add role field to registration serializer and enable lawyer registration from frontend
- `ff5461f` - feat: Add automatic LawyerProfile creation on user registration (F-001)

**Wnioski:**
- PR-y są **prawie gotowe** - tylko drobne zmiany (refaktoryzacja, puste linie)
- Kod wygląda na kompletny i działający
- Główna blokada to prawdopodobnie emocjonalna (strach przed review, prokrastynacja)

---

## Pytania do rozpisania (do uzupełnienia)

### 1. Pożądany rezultat
**Co chcesz osiągnąć w najbliższym czasie?**
- [x] Wrzucić te PR-y?
- [x] Wrócić do regularnej pracy?
- [x] Zakończyć feature profilu prawnika?

**Odpowiedź:**
Wszystkie 3 - chcę wrzucić PR-y, wrócić do regularnej pracy i zakończyć feature profilu prawnika.

### 2. Zawartość PR-ów
**Co dokładnie zawierają te PR-y o profilu prawnika? Jaką funkcjonalność dodają?**

**Odpowiedź:**
Muszę sobie przypomnieć co już zostało zrobione, plus tak naprawdę obejrzeć kod i upewnić się, że go rozumiem.

**Pomysł na pomoc:**
Przejść przez kod kawałeczkami z AI - pokazywać co zostało zrobione w kontekście, dbając o to że rozumiem. AI powinien:
- Pokazywać małe kawałki kodu
- Wyjaśniać kontekst każdej zmiany
- Sprawdzać czy rozumiem przed przejściem dalej
- Łączyć zmiany z szerszym kontekstem projektu

### 3. Blokada emocjonalna
**Co Cię najbardziej blokuje?**
- [x] Strach przed komentarzami/krytyką?
- [ ] Przytłoczenie ilością pracy?
- [x] Brak jasności co do wymagań?
- [x] Coś innego?

**Odpowiedź:**
Strach przed krytyką, ale głównie dlatego że:
- Od tak dawna nie pracowałem nad tym projektem
- Nie wiem co trzeba zrobić żeby pchnąć do przodu - **brak jasności (clarity)**
- Jarzę się teraz innymi tematami (budowanie agentowych rozwiązań w Cursorze) i mało mnie to interesuje
- Utknąłem w próbie budowania systemu - przesadziłem, potrzebuję prostszego podejścia

**Kluczowe potrzeby:**
1. **Clarity** - jasność co dalej zrobić
2. **Połączenie z motywacją** - jak połączyć to co mnie jara (agentowe rozwiązania) z projektem Lawly
3. **Prostsze podejście** - do systemu który buduję (nie przesadzać)

**Pomysły na połączenie z tym co jara:**
- Użyć Cursor AI do przejścia przez kod kawałeczkami (już zapisane wyżej)
- Może zbudować prosty agent do pomocy z code review?
- Może użyć agenta do generowania testów dla nowych endpointów?
- Może zbudować prosty workflow w Cursorze do automatyzacji części pracy nad PR-ami?
- **Klucz:** Proste, praktyczne rozwiązania, nie przesadzać

### 4. Deadline i kontekst
**Są jakieś deadline'y? Czy Roman czeka na to? Czy to blokuje innych?**

**Odpowiedź:**
_[do uzupełnienia]_

### 5. Pierwszy krok
**Co by było najłatwiejszym pierwszym krokiem jutro? (5-15 minut, żeby "ruszyć lawinkę")**

**Odpowiedź:**
_[do uzupełnienia]_

---

## Następna akcja
_[Do zdefiniowania po uzupełnieniu pytań]_

## Zadania do wykonania
_[Lista konkretnych akcji - powstanie po rozpisaniu projektu]_

