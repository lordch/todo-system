# Lawly AI Agents Operating System

**Version**: 1.0  
**Last Updated**: 2024-12-08  
**Purpose**: Procedural context for AI agents working on Lawly

---

## Philosophy

This file serves as the "operating system" for AI agents working on Lawly. It defines:
- How we work together (human + AI collaboration)
- What conventions we follow (code quality, architecture)
- How we maintain clarity and focus (context engineering)

### Core Principles

**1. Human-AI Collaboration**
- **AI does execution**: Coding, refactoring, testing, documentation
- **Human does decisions**: Architecture, priorities, trade-offs, strategic direction
- **Supervision = Context Curation**: Not action approval, but providing right context

**2. Context Engineering**
- **Intentional Compaction**: Focused markdown files with only essentials
- **Context <40%**: Keep context window under 40% to avoid "dumb zone"
- **Plan as Source of Truth**: When stuck in implementation → fix plan, not code

**3. Simplicity Over Perfection**
- "Good enough is good enough" - ship working features
- Prefer simple, maintainable solutions over clever optimizations
- Code is self-documenting through clear naming and structure

---

## Tech Stack

### Backend (lawly-be)
- **Python 3.12**, **Django 5.2**, **Django Ninja** (REST API)
- **PostgreSQL 17** (full-text search, trigram similarity)
- **Poetry** for dependency management
- **pytest** (testing), **black** (formatting), **isort** (imports), **ruff** (linting)

### Frontend (lawly-fe)
- **Next.js**, **TypeScript**, **React**
- **TanStack Query** (data fetching)
- **Tailwind CSS** (styling)

### Repository Structure
- `/Users/higher/Projects/lawly/` - Main workspace
- `/Users/higher/Projects/lawly-be/` - Backend Django project
- `/Users/higher/Projects/lawly-fe/` - Frontend Next.js project

---

## Architecture Patterns

### Backend: Service Layer Pattern

**Core Principle**: Business logic belongs in services, not in views or models.

#### Structure
```
app/
├── models.py          # Data definitions only (fields, Meta, clean(), properties)
├── services/          # Business logic (queries, calculations, validation)
│   ├── __init__.py    # Export public functions with __all__
│   └── service.py     # Service functions (list_, get_, create_, update_, delete_)
├── api.py             # Thin API layer (delegates to services)
├── schemas.py         # Django Ninja schemas (request/response)
└── tests/             # Tests (pytest)
    ├── test_api.py
    ├── test_services.py
    └── test_models.py
```

#### What Goes Where

**Models** (data definitions):
- Field definitions
- Model-level validation (`clean()` method)
- Simple properties (calculated from model fields)
- `__str__()` and `__repr__()` methods
- ❌ NO business logic, external API calls, complex calculations

**Services** (business logic):
- Database queries and filtering
- Business validation and rules
- Complex calculations
- Data transformations
- Cross-model operations
- ✅ Full docstrings with `Args`, `Returns`, `Raises`
- ✅ Private helpers prefixed with `_`

**API Layer** (thin):
- Request/response handling
- Parameter parsing (query params, body, path)
- Authentication/authorization checks
- Delegation to services
- HTTP exception handling
- ❌ NO business logic, direct DB queries

#### Example Pattern
```python
# services/lawyer_service.py
def list_lawyers(
    search: str | None = None,
    city_id: int | None = None,
    ordering: str = "-created_at",
) -> QuerySet[LawyerProfile]:
    """
    List and filter verified lawyers.
    
    Args:
        search: Text search query
        city_id: Filter by city
        ordering: Field to order by
    
    Returns:
        QuerySet of filtered LawyerProfile objects
    
    Raises:
        ValidationError: If ordering field is invalid
    """
    queryset = LawyerProfile.objects.filter(status="verified")
    queryset = _apply_search_filter(queryset, search)
    if city_id:
        queryset = queryset.filter(city_id=city_id)
    return queryset.order_by(ordering)


def _apply_search_filter(queryset: QuerySet, search: str | None) -> QuerySet:
    """Private helper - apply search filter."""
    if search and search.strip():
        queryset = queryset.filter(search_vector=SearchQuery(search, config="polish"))
    return queryset
```

```python
# api.py
from ninja import Router, Query
from lawyers.services import list_lawyers

router = Router(tags=["Lawyers"])

@router.get("/", response=list[LawyerListOut])
@paginate(PageNumberPagination)
def list_lawyers_endpoint(request, filters: LawyerFilterIn = Query(...)):
    """Browse and filter verified lawyers."""
    return list_lawyers(
        search=filters.search,
        city_id=filters.city_id,
        ordering=filters.ordering or "-created_at",
    )
```

### Frontend: Component Pattern
- **Smart components**: Handle data fetching (TanStack Query)
- **Dumb components**: Pure UI, props in → JSX out
- **Hooks**: Reusable logic (`useAuth`, `useSearch`, `useLawyer`)

---

## Code Conventions

### Zero Comments Policy

**General Rule**: Do NOT add comments. Code should be self-documenting.

**❌ Prohibited**:
- Comments that restate code: `counter += 1  # increment counter`
- Obvious explanations: `user.email = email  # set user email`
- Duplicate docstring info

**✅ Allowed Only For**:
- Complex business logic that cannot be simplified
- Workarounds for known issues (with context)
- TODOs with clear action items
- Test setup explanations (when not obvious)

### Docstrings (Google Style)

**Required for**:
- All public service functions (Args, Returns, Raises)
- All API endpoints (description, parameters)
- Public classes (brief description)

**Forbidden for**:
- Test methods (unless adding non-obvious context)
- Simple private helpers (if name is self-explanatory)

Example:
```python
def create_case(client_id: int, lawyer: User, title: str) -> Case:
    """
    Create a new case with auto-generated case number.
    
    Args:
        client_id: ID of the client user
        lawyer: Authenticated lawyer user creating the case
        title: Case title
    
    Returns:
        Created Case instance
    
    Raises:
        Http404: If client not found
        ValidationError: If case data is invalid
    """
    ...
```

### Type Hints

**Always use**:
- Type hints for all function parameters and return values
- Modern syntax: `str | None` (not `Optional[str]`)
- Specific types: `QuerySet[LawyerProfile]` (not just `QuerySet`)

### Naming Conventions

- **Functions/methods**: `snake_case`, verb-based (`list_lawyers`, `get_profile`, `create_case`)
- **Classes**: `PascalCase`, noun-based (`LawyerProfile`, `CaseDocument`)
- **Variables**: `snake_case`, descriptive (`lawyer_profile`, `case_documents`)
- **Constants**: `UPPER_SNAKE_CASE` (`DEFAULT_ORDERING`, `MAX_PAGE_SIZE`)
- **Private helpers**: Prefix with `_` (`_apply_filter`, `_validate_input`)

### Testing

- **Framework**: pytest (not Django TestCase)
- **Naming**: `test_<what>_<expected_behavior>`
- **Test classes**: `TestFeatureName` (e.g., `TestListLawyers`)
- **Database access**: Use `@pytest.mark.django_db` decorator
- **Structure**: Arrange-Act-Assert pattern
- **Coverage**: All new code must have tests

Example:
```python
@pytest.mark.django_db
class TestListLawyers:
    def test_returns_only_verified_lawyers(self):
        # Arrange
        verified = User.objects.create_user(email="verified@test.com", password="test")
        pending = User.objects.create_user(email="pending@test.com", password="test")
        LawyerProfile.objects.create(user=verified, status="verified")
        LawyerProfile.objects.create(user=pending, status="pending")
        
        # Act
        results = list_lawyers()
        
        # Assert
        assert results.count() == 1
        assert results.first().user == verified
```

### Code Quality

- **Line length**: 120 characters
- **Formatting**: `black` (automatic)
- **Import sorting**: `isort` (automatic)
- **Linting**: `ruff` (catches errors, enforces conventions)

Run before committing:
```bash
cd /Users/higher/Projects/lawly-be
poetry run black .
poetry run isort .
poetry run ruff check .
poetry run pytest
```

---

## Context Engineering Workflow

We use **Research-Plan-Implement** for all features (User Stories).

### Quick Reference

1. **RESEARCH** → `research/US-XXX.md`
   - Explore codebase (models, services, API, tests)
   - Identify patterns and files to modify
   - Document dependencies and blockers

2. **PLAN** → `plans/US-XXX.md`
   - Create step-by-step implementation blueprint
   - Detail per-file changes (what, where, why)
   - Define test strategy and edge cases

3. **IMPLEMENT** → `progress/US-XXX.md` + Working code
   - Execute plan mechanically
   - Track progress continuously
   - If stuck → go back to PLAN (don't improvise!)

**See**: `.context/WORKFLOW.md` for detailed workflow documentation

### Key Rules

1. **Context Window <40%**: Avoid "dumb zone" where AI loses effectiveness
2. **Plan as Source of Truth**: When implementation fails → update plan, not code
3. **Intentional Compaction**: Research/Plan files are focused, not comprehensive
4. **Use Subagents**: For research-heavy tasks (exploring large files, multiple searches)
5. **Red Flag**: If AI says "You're absolutely right" → AI lost thread, reassess

### Integration with Git

- Branch per feature: `feature/US-XXX-title`
- Commit research/plan before coding (transparency)
- Progress file updated continuously (don't commit mid-implementation)
- Archive after merge to main

---

## Reusable Atoms

**See**: `.context/atoms.md` for catalog of reusable components/APIs

Common patterns to reuse:
- Authentication helpers (`get_authenticated_lawyer`)
- Service layer functions (`list_`, `get_`, `create_`, `update_`)
- Test fixtures (users, profiles, cities, specializations)
- Query patterns (select_related, prefetch_related, search)

---

## Decision Log

All architectural decisions are recorded in: `.context/decisions.md`

When making a significant decision:
1. Document context (why decision was needed)
2. List options considered
3. State decision made
4. Explain rationale

---

## Quick Links

- **Coding Standards**: `/Users/higher/Projects/lawly/CODING_STANDARDS.md`
- **Project Conventions**: `/Users/higher/Projects/lawly/.cursor/rules/project-conventions.cursorrules`
- **Backend README**: `/Users/higher/Projects/lawly-be/README.md`
- **Workflow Details**: `.context/WORKFLOW.md`
- **Templates**: `.context/templates/`

---

## For New AI Agents

If you're working on Lawly:

1. **Read this file first** - understand philosophy and conventions
2. **Read WORKFLOW.md** - understand Research-Plan-Implement process
3. **Check existing work** - look in `.context/archive/` for examples
4. **Follow the plan** - don't improvise during implementation
5. **Keep context focused** - use intentional compaction, stay <40%

**Remember**: You're here to execute (coding, testing, refactoring). Human makes strategic decisions. Your superpower is maintaining clarity through proper context management.


