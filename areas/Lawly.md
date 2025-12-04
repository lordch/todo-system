# Lawly (Area)

**Typ:** Biznes / Rozwój produktu  
**Ostatnia aktualizacja:** 2025-12-04

## Standard / Rezultat długoterminowy
Rozwijać Lawly jako działający marketplace łączący klientów z prawnikami w Polsce.

---

## Kontekst

**Lawly** - marketplace platforma łącząca klientów z prawnikami w Polsce.

**Struktura repo:**
- `/Users/higher/Projects/lawly/` - główny folder z dokumentacją i workspace
- `/Users/higher/Projects/lawly-be/` - Backend (Django 5.2, Django Ninja, PostgreSQL)
- `/Users/higher/Projects/lawly-fe/` - Frontend (Next.js, TypeScript)

**Tech stack:**
- Backend: Python 3.12, Django 5.2, Django Ninja (REST API), PostgreSQL 17, Poetry
- Frontend: Next.js, TypeScript, React

**Zespół:**
- 3 developerów (Ty, Roman, +1)
- Łukasz (biznes, koncept)
- Adrian (biznes)
- Zakładanie spółki, wniosek o dofinansowanie
- Brak wynagrodzenia - praca społeczna, samoorganizacja
- Brak sztywnych deadline'ów

---

## Aktywne projekty
- [Lawyer Onboarding](../projects/Lawyer-Onboarding.md) 🟡 - US-081: Profile Management

## Backlog pomysłów (projekty do rozpisania)
- [ ] User Profile Management (klienci)
- [ ] Service Management (CRUD usług prawnika)
- [ ] Kalendarze, sloty, rezerwacje
- [ ] Case management
- [ ] Matching algorithm dla prawników
- [ ] System recenzji i ocen

## Zadania operacyjne (nie-projekty)
_Brak aktualnych zadań_

---

## Dalsza kolejność (roadmap)
1. Profile & Service Management
2. Kalendarze, sloty, rezerwacje
3. Case management

---

## Notatki

### Połączenie z tym co jara (agentowe rozwiązania)

**Pomysły na wykorzystanie AI w workflow:**

1. **Cursor AI do nauki kodu** ✅ (w trakcie):
   - Przejść przez implementację kawałeczkami
   - AI pokazuje kontekst, sprawdza zrozumienie
   - Buduje confidence przed review

2. **Agent do code review** (prosty):
   - Checklist przed push: testy? dokumentacja? typy?
   - Automatyczne sprawdzenie czy są wszystkie potrzebne pliki

3. **Agent do generowania testów** (przyszłość):
   - Gdy dodajesz nowy endpoint, agent sugeruje testy

4. **Workflow automation** (prosty):
   - Jeden command do: commit → push → create PR
   - Szablon PR description

5. **Agentowe rozwiązanie w Lawly** (długoterminowe):
   - AI do automatyzacji matchingu klientów z prawnikami
   - Chatbot do pomocy klientom w wyborze prawnika

**Klucz:** 
- Proste, praktyczne rozwiązania
- Nie przesadzać
- Każde narzędzie musi rozwiązywać konkretny problem

