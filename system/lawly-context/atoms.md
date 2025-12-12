# Reusable Atoms Catalog

**Purpose**: Catalog of reusable components, APIs, and patterns in Lawly  
**Status**: Growing - add new atoms as they're implemented

---

## What is an Atom?

An "atom" is a reusable piece of code or pattern that can be referenced and reused across features. Think of it as building blocks.

**Types of Atoms:**
- Backend services (functions that can be reused)
- API endpoints (patterns to follow)
- Frontend components (UI building blocks)
- Test fixtures (test data setup)
- Patterns (architectural approaches)

---

## Backend Services

### Authentication

#### `get_authenticated_lawyer(request)`
**Location**: `lawyers/auth.py`  
**Status**: ✅ Implemented  
**Purpose**: Helper for authenticating lawyer users in API endpoints

**Usage**:
```python
from lawyers.auth import get_authenticated_lawyer

@router.get("/me/profile/")
def get_my_profile(request):
    lawyer = get_authenticated_lawyer(request)
    # ... use lawyer.user
```

**What it does**:
- Validates token authentication
- Checks user has "lawyer" role
- Returns authenticated User instance
- Raises HttpError 401/403 if invalid

**When to use**: Any API endpoint that requires lawyer authentication

---

### Lawyer Services

#### `list_lawyers(...)`
**Location**: `lawyers/services/lawyer_service.py`  
**Status**: ✅ Implemented  
**Purpose**: Query and filter verified lawyers

**Signature**:
```python
def list_lawyers(
    search: str | None = None,
    specialization: list[int] | None = None,
    city_id: int | None = None,
    min_rating: float | None = None,
    ordering: str = "-created_at",
) -> QuerySet[LawyerProfile]:
```

**When to use**: Any feature that needs to list/filter lawyers

---

#### `get_my_profile(user)`
**Location**: `lawyers/services/lawyer_service.py`  
**Status**: ✅ Implemented  
**Purpose**: Get authenticated lawyer's profile

**Signature**:
```python
def get_my_profile(user: User) -> LawyerProfile:
    """
    Raises:
        Http404: If profile doesn't exist
    """
```

**When to use**: Profile viewing/editing features

---

#### `create_profile(user, data: dict)`
**Location**: `lawyers/services/lawyer_service.py`  
**Status**: ✅ Implemented  
**Purpose**: Create/update lawyer profile

**Signature**:
```python
def create_profile(user: User, data: dict) -> LawyerProfile:
    """
    Args:
        data: Dict with keys: first_name, last_name, bio, city_id, 
              specialization_ids, phone, practice_start_date
    
    Raises:
        ValidationError: If data is invalid
    """
```

**When to use**: Profile creation/update features

---

### City Services

#### `list_cities(...)`
**Location**: `lawyers/services/city_service.py`  
**Status**: ✅ Implemented  
**Purpose**: List cities with verified lawyers

**When to use**: City filters, location selection

---

### Specialization Services

#### `list_specializations()`
**Location**: `lawyers/services/specialization_service.py`  
**Status**: ✅ Implemented  
**Purpose**: List all legal specializations

**When to use**: Specialization filters, profile forms

---

## API Patterns

### Paginated List Endpoint

**Pattern**: Django Ninja + PageNumberPagination

**Example**:
```python
from ninja import Router, Query
from config.pagination import PageNumberPagination
from ninja.pagination import paginate

router = Router(tags=["Resource"])

@router.get("/", response=list[ResourceOut])
@paginate(PageNumberPagination)
def list_resources(request, filters: ResourceFilterIn = Query(...)):
    return resource_service.list_resources(**filters.dict())
```

**When to use**: Any list endpoint that returns multiple items

---

### Authenticated Endpoint

**Pattern**: Use authentication helper

**Example**:
```python
from lawyers.auth import get_authenticated_lawyer

@router.get("/me/resource/")
def get_my_resource(request):
    user = get_authenticated_lawyer(request)  # or similar helper
    return service.get_resource(user)
```

**When to use**: Any endpoint requiring authentication

---

## Frontend Components

### Forms

#### `ProfileForm`
**Location**: `src/components/lawyer/ProfileForm.tsx`  
**Status**: ✅ Implemented  
**Purpose**: Lawyer profile creation/editing form

**Props**:
```typescript
interface ProfileFormProps {
  initialData?: LawyerProfile;
  onSubmit: (data: ProfileFormData) => void;
  cities: City[];
  specializations: Specialization[];
}
```

**When to use**: Profile editing features

---

### Layout Components

#### `DashboardSidebar`
**Location**: `src/components/dashboard/DashboardSidebar.tsx`  
**Status**: ✅ Implemented  
**Purpose**: Navigation for lawyer dashboard

**When to use**: Any lawyer dashboard pages

---

## Test Fixtures

### User Fixtures

**Pattern**: Create test users with pytest fixtures

**Example**:
```python
@pytest.fixture
def lawyer_user():
    return User.objects.create_user(
        email="lawyer@test.com",
        password="TestPass123!",
        role="lawyer"
    )

@pytest.fixture
def client_user():
    return User.objects.create_user(
        email="client@test.com",
        password="TestPass123!",
        role="client"
    )
```

**When to use**: Any test requiring authenticated users

---

### Profile Fixtures

**Pattern**: Create test lawyer profiles

**Example**:
```python
@pytest.fixture
def lawyer_profile(lawyer_user, city, specialization):
    return LawyerProfile.objects.create(
        user=lawyer_user,
        first_name="Jan",
        last_name="Kowalski",
        bio="Test bio with more than 50 characters for validation",
        city=city,
        status="verified",
    )
```

---

## Patterns

### Service Layer Pattern

**Structure**:
```
app/services/
├── __init__.py        # Export with __all__
└── resource_service.py  # Service functions
```

**Service Function Template**:
```python
def operation_resource(param: Type, ...) -> ReturnType:
    """
    Brief description.
    
    Args:
        param: Description
    
    Returns:
        Description
    
    Raises:
        ExceptionType: When it happens
    """
    # Business logic here
    return result
```

**API Endpoint Template**:
```python
@router.post("/")
def create_resource(request, data: ResourceIn):
    """API endpoint description."""
    return resource_service.create_resource(data.dict())
```

**When to use**: Always for business logic

---

### Signal Pattern (Auto-Creation)

**Pattern**: Use Django signals for auto-creation on related model save

**Example**:
```python
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created and instance.role == "lawyer":
        LawyerProfile.objects.get_or_create(
            user=instance,
            defaults={"status": "draft"}
        )
```

**When to use**: Auto-create related records (profile, settings, etc.)

---

### Query Optimization Pattern

**Pattern**: Use select_related and prefetch_related

**Example**:
```python
def get_lawyer_profile(lawyer_id: int) -> LawyerProfile:
    return LawyerProfile.objects.select_related(
        "city", "user"
    ).prefetch_related(
        "specializations", "services"
    ).get(id=lawyer_id)
```

**When to use**: Any query with ForeignKey or ManyToMany relationships

**Why**: Avoids N+1 queries

---

## How to Add New Atoms

When you implement something reusable:

1. **After feature is complete** (don't add atoms for unfinished work)
2. **Add entry to this file** in appropriate section
3. **Include**: Location, status, purpose, usage example
4. **Keep it concise**: Just enough info to find and use it

**Commit message**: `docs: Add [atom name] to atoms catalog`

---

## Notes

- **Status indicators**:
  - ✅ Implemented and tested
  - 🚧 In progress
  - 📋 Planned
  - ⚠️ Deprecated (include replacement)

- **Keep this updated**: When refactoring atoms, update here
- **Link from research**: When researching, reference atoms by name


