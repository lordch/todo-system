# Lawyer Onboarding

## Status
**Ostatnia aktualizacja:** 2025-12-08  
**Stan:** 🟡 Umiarkowanie jasny / Ready to go  
**Obszar:** [Lawly](../areas/Lawly.md)

### Obecna sytuacja (zaktualizowana)
- ✅ **Zacommitowane:** Refaktoryzacja autentykacji w backend (2025-12-08)
- ✅ **Wyczyszczone:** Przypadkowe puste linie w frontend
- ⏸️ **Pozostało:** `create_test_users.py` (untracked) - do commitowania później
- 📋 **Branch:** `feature/US-081-profile-management` (9 commitów)
- 🔄 **Następne kroki:** Przejrzeć kod, zrozumieć implementację, push i PR

---

## Kontekst projektu

### Co to za projekt?
**US-081: Profile Management** - system zarządzania profilami prawników w Lawly.

**Struktura repo:**
- Backend: `/Users/higher/Projects/lawly-be/`
- Frontend: `/Users/higher/Projects/lawly-fe/`

---

## Szczegółowy opis implementacji (Backend)

### F-001: Automatyczne tworzenie profilu prawnika (`ff5461f`)
**Data:** 2025-11-05 17:32  
**Commit:** `feat: Add automatic LawyerProfile creation on user registration (F-001)`

**Co zostało zrobione:**
- Dodano signal handler `create_lawyer_profile` w `lawyers/signals.py`
- Signal automatycznie tworzy `LawyerProfile` ze statusem `"draft"` gdy tworzony jest `User` z rolą `"lawyer"`
- Użyto `get_or_create()` dla idempotentności (można wywoływać wielokrotnie)
- Dodano obsługę błędów z loggingiem (nie blokuje rejestracji)
- Dodano kompleksowe testy w `lawyers/tests/test_signals.py` (6 przypadków testowych)
- **Zmienione pliki:** `lawyers/signals.py`, `lawyers/tests/test_signals.py` (133 linie)

**Rezultat:** Każdy prawnik automatycznie dostaje pusty profil przy rejestracji.

---

### F-002a: Schema dla tworzenia profilu (`b80b1bd`)
**Data:** 2025-11-05 18:40  
**Commit:** `feat: Add LawyerProfileCreateIn schema (F-002)`

**Co zostało zrobione:**
- Dodano `LawyerProfileCreateIn` schema w `lawyers/schemas.py`
- Pola wymagane: `first_name`, `last_name`, `bio` (min 50 znaków), `city_id`, `specialization_ids` (min 1)
- Pola opcjonalne: `phone`, `practice_start_date`
- Walidacja: min/max długości, wymagane pola
- **Zmienione pliki:** `lawyers/schemas.py` (15 linii)

**Rezultat:** Walidacja danych wejściowych dla tworzenia/aktualizacji profilu.

---

### F-002b: Service method dla tworzenia profilu (`63880dc`)
**Data:** 2025-11-05  
**Commit:** `feat: Add create_profile service method (F-002)`

**Co zostało zrobione:**
- Dodano `create_profile(user, data: dict)` w `lawyers/services/lawyer_service.py`
- Logika: aktualizuje istniejący profil (stworzony przez signal F-001)
- Walidacja: sprawdza czy `city_id` i `specialization_ids` istnieją
- Automatycznie ustawia `is_verified=True` (tymczasowo, póki nie ma procesu weryfikacji)
- Status pozostaje `"draft"` po utworzeniu
- **Zmienione pliki:** `lawyers/services/lawyer_service.py`

**Rezultat:** Business logic do wypełniania profilu prawnika.

---

### F-002c: POST endpoint dla tworzenia profilu (`a1af7ba`)
**Data:** 2025-11-05  
**Commit:** `feat: Add POST /me/profile/ endpoint for profile creation (F-002)`

**Co zostało zrobione:**
- Dodano endpoint `POST /me/profile/` w `lawyers/api.py`
- Używa `create_profile` service method
- Wymaga autentykacji (token)
- Walidacja: tylko prawnik może aktualizować swój profil
- Obsługa błędów: 400 (ValidationError), 404 (profil nie istnieje), 500 (inne błędy)
- **Zmienione pliki:** `lawyers/api.py`

**Rezultat:** API endpoint do wypełniania profilu przez prawnika.

---

### F-002d: Dodanie role field do rejestracji (`5432372`)
**Data:** 2025-11-05  
**Commit:** `feat: Add role field to registration serializer and enable lawyer registration from frontend`

**Co zostało zrobione:**
- Dodano pole `role` do serializera rejestracji (`users/serializers.py`)
- Umożliwia wybranie roli przy rejestracji (client/lawyer)
- **Zmienione pliki:** `users/serializers.py`

**Rezultat:** Frontend może rejestrować prawników (nie tylko klientów).

---

### F-003a: Service method GET profilu (`e1c04df` część 1)
**Data:** 2025-11-05 20:00  
**Commit:** `feat: Add GET /me/profile/ endpoint for profile view (F-003)`

**Co zostało zrobione (service layer):**
- Dodano `get_my_profile(user)` w `lawyers/services/lawyer_service.py`
- Zwraca profil prawnika niezależnie od statusu (draft/active/inactive)
- Rzuca `Http404` jeśli profil nie istnieje
- **Zmienione pliki:** `lawyers/services/lawyer_service.py` (26 linii)

---

### F-003b: GET endpoint dla profilu (`e1c04df` część 2)
**Data:** 2025-11-05 20:00  

**Co zostało zrobione (API layer):**
- Dodano endpoint `GET /me/profile/` w `lawyers/api.py`
- Używa `get_my_profile` service method
- Wymaga autentykacji (token)
- Zwraca `LawyerProfileOut` schema
- **Zmienione pliki:** `lawyers/api.py`

---

### F-003c: Testy (`e1c04df` część 3)
**Data:** 2025-11-05 20:00  

**Co zostało zrobione (testy):**
- Dodano kompleksowe testy w `lawyers/tests/test_api.py` (374 linie)
- Dodano testy service layer w `lawyers/tests/test_lawyer_service.py` (249 linii)
- Zaktualizowano README.md z dokumentacją (68 linii)
- Dodano zależności: `pytest`, `pytest-django`
- **Zmienione pliki:** 7 plików, +736 linii

**Rezultat:** Pełna pokrycie testami GET i POST endpointów.

---

### F-003d: Style fixes (`380ea5f`)
**Data:** 2025-11-05  
**Commit:** `style: Remove inline comments from GET /me/profile/ endpoint`

**Co zostało zrobione:**
- Usunięto inline komentarze z kodu (cleanup)
- **Zmienione pliki:** `lawyers/api.py`

---

### F-003e: Export fix (`a971c62`)
**Data:** po 2025-11-05  
**Commit:** `fix: Export get_my_profile function in services __init__`

**Co zostało zrobione:**
- Dodano export `get_my_profile` w `lawyers/services/__init__.py`
- Umożliwia import: `from lawyers.services import get_my_profile`
- **Zmienione pliki:** `lawyers/services/__init__.py`

---

### F-004: Refaktoryzacja autentykacji (`040866a`) ✅ DZISIAJ
**Data:** 2025-12-08  
**Commit:** `refactor: Extract get_authenticated_lawyer helper to reduce duplication`

**Co zostało zrobione:**
- Wydzielono `get_authenticated_lawyer(request)` do `lawyers/auth.py`
- Zastąpiono duplikację kodu w `get_my_profile()` i `create_profile()` endpointach
- Usunięto nieużywany import `Token` z `lawyers/api.py`
- **Zmienione pliki:** `lawyers/api.py`, `lawyers/auth.py` (2 pliki, +40/-27 linii)

**Rezultat:** DRY principle - jedna funkcja do autentykacji prawników.

---

## Podsumowanie funkcjonalności

**Co działa:**
1. ✅ Automatyczne tworzenie profilu przy rejestracji prawnika (draft status)
2. ✅ GET `/me/profile/` - prawnik może zobaczyć swój profil
3. ✅ POST `/me/profile/` - prawnik może wypełnić/zaktualizować profil
4. ✅ Walidacja danych (bio min 50 znaków, wymagane pola)
5. ✅ Testy (signal tests, API tests, service tests)
6. ✅ Refaktoryzacja autentykacji (DRY)

**Co pozostało (niezacommitowane):**
- ⏸️ `users/management/commands/create_test_users.py` - management command do tworzenia użytkowników testowych

**Frontend:**
- ✅ Clean (usunięte przypadkowe puste linie)
- Prawdopodobnie ma gotowy formularz `ProfileForm` i stronę `/panel/profil/edit/`

---

## Plan manualnego testowania

### Setup (jednorazowo, ~10 min)

#### 1. Uruchom backend:
```bash
cd /Users/higher/Projects/lawly-be

# Uruchom PostgreSQL (jeśli nie działa)
docker-compose up -d

# Aktywuj virtualenv (poetry)
poetry shell

# Uruchom serwer
poetry run python manage.py runserver
```
Backend będzie na: http://localhost:8000

#### 2. Stwórz test users (użyj gotowego command!):
```bash
# W tym samym terminalu (backend)
poetry run python manage.py create_test_users

# Zobaczysz:
# ✓ Created user: lawyer1@test.com
# ✓ Created user: lawyer2@test.com
# ✓ Created user: client1@test.com
# + tokeny do testowania
```

**Zapisz tokeny** - będą potrzebne do testów!

#### 3. Uruchom frontend (osobny terminal):
```bash
cd /Users/higher/Projects/lawly-fe
yarn dev
```
Frontend będzie na: http://localhost:3000

---

### Scenariusze testowania

#### Test 1: Automatyczne tworzenie profilu (F-001) ✅
**Cel:** Sprawdzić czy signal działa

**Kroki:**
1. Test user `lawyer1@test.com` już istnieje (stworzony przez command)
2. Backend: sprawdź w admin czy ma LawyerProfile (http://localhost:8000/admin)
3. Lub użyj GET endpoint (test 2)

**Oczekiwany rezultat:**
- Prawnik ma pusty profil ze statusem "draft"

---

#### Test 2: GET /me/profile/ (F-003) ✅
**Cel:** Pobrać profil prawnika

**Metoda 1 - curl:**
```bash
# Użyj tokenu lawyer1 z create_test_users output
curl -H "Authorization: Token <LAWYER1_TOKEN>" \
     http://localhost:8000/api/lawyers/me/profile/
```

**Metoda 2 - Postman/Insomnia:**
- URL: `GET http://localhost:8000/api/lawyers/me/profile/`
- Header: `Authorization: Token <LAWYER1_TOKEN>`

**Oczekiwany rezultat (JSON):**
```json
{
  "id": 1,
  "first_name": "Anna",
  "last_name": "Kowalska",
  "bio": "...",
  "status": "draft",
  ...
}
```

**Co sprawdzać:**
- ✅ Status 200
- ✅ Zwraca dane prawnika
- ❌ 401 bez tokenu
- ❌ 403 z tokenem klienta (użyj client1 token)

---

#### Test 3: POST /me/profile/ (F-002) ✅
**Cel:** Zaktualizować profil prawnika

**Przygotowanie:**
- Pobierz dostępne `city_id`: `GET http://localhost:8000/api/marketplace/cities/`
- Pobierz `specialization_ids`: `GET http://localhost:8000/api/marketplace/specializations/`

**Request (curl):**
```bash
curl -X POST http://localhost:8000/api/lawyers/me/profile/ \
  -H "Authorization: Token <LAWYER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Anna",
    "last_name": "Kowalska-Testowa",
    "bio": "Jestem prawnikiem z 10-letnim doświadczeniem w prawie rodzinnym. Specjalizuję się w rozwodach i opiece nad dziećmi.",
    "city_id": 1,
    "specialization_ids": [1, 2],
    "phone": "+48 123 456 789",
    "practice_start_date": "2015-01-15"
  }'
```

**Oczekiwany rezultat:**
- ✅ Status 200
- ✅ Zwraca zaktualizowany profil
- ✅ Bio ma min 50 znaków (walidacja)
- ❌ 400 jeśli bio < 50 znaków
- ❌ 400 jeśli brak wymaganego pola
- ❌ 401 bez tokenu
- ❌ 403 z tokenem klienta

---

#### Test 4: Frontend - formularz profilu
**Cel:** Sprawdzić czy formularz działa

**Kroki:**
1. Otwórz http://localhost:3000
2. Zaloguj się jako `lawyer1@test.com` / `TestPass123!`
3. Przejdź do `/panel/profil/edit`
4. Wypełnij formularz:
   - Imię, nazwisko
   - Bio (min 50 znaków)
   - Miasto (dropdown)
   - Specjalizacje (multiselect)
   - Telefon (opcjonalnie)
5. Zapisz

**Co sprawdzać:**
- ✅ Formularz się ładuje
- ✅ Pola są wypełnione (jeśli profil istnieje)
- ✅ Walidacja działa (bio min 50 znaków)
- ✅ Zapisywanie działa (loading state?)
- ✅ Komunikat sukcesu
- ✅ Po zapisie dane są zaktualizowane
- ❌ Obsługa błędów (np. brak internetu)

---

## Zadania do wykonania (TODO)

### Priorytet 1: Zrozumienie
- [x] 📚 Przejść przez kod z AI (zrozumieć implementację) - ✅ ZROBIONE

### Priorytet 2: Testowanie
- [x] 🚀 Setup: uruchomić backend i frontend - ✅ ZROBIONE
- [ ] 👥 Stworzyć test users (create_test_users)
- [ ] 🧪 Test 1: Sprawdzić automatyczne tworzenie profilu
- [ ] 🧪 Test 2: GET /me/profile/ (różne tokeny)
- [ ] 🧪 Test 3: POST /me/profile/ (happy path + edge cases)
- [ ] 🧪 Test 4: Frontend - formularz profilu
- [ ] 📋 Zapisać wyniki testów (co działa, co nie)

### Priorytet 3: Finalizacja
- [ ] ✅ Zacommitować `create_test_users.py` (jeśli testy przeszły)
- [x] 🔄 Push brancha (backend ✅, frontend - problem z SSH, do naprawienia)
- [ ] 📝 Stworzyć draft PR w GitHub (backend: https://github.com/lawly-pl/lawly-be/pull/new/feature/US-081-profile-management)
- [ ] 📬 Oznaczyć Roman do review

---

## Najmniejszy pierwszy krok (5-15 min)

**Co zrobić teraz/jutro:**

1. **Otworzyć projekt w VS Code** (2 min)
   ```bash
   cd /Users/higher/Projects/lawly-be
   code .
   ```

2. **Przejrzeć `lawyers/auth.py`** (5 min)
   - Przeczytać kod funkcji `get_authenticated_lawyer()`
   - Zrozumieć co robi (walidacja tokenu + roli)
   - Odpowiedzieć sobie: "Czy rozumiem tę funkcję?"

3. **Przejrzeć jak jest używana w `lawyers/api.py`** (5 min)
   - Zobaczyć jak zastąpiła duplikację
   - Porównać z poprzednią wersją (git diff)

4. **Powiedz AI: "Zrozumiałem refaktoryzację, przejdźmy dalej"**

**Alternatywa (jeszcze mniejszy krok):**
- Po prostu otwórz projekt i przeczytaj `lawyers/auth.py` (2-3 min)
- Nie musisz nic więcej robić tego dnia

---

## Motto

"Good enough is good enough" - nie musi być perfekcyjne, musi działać.




