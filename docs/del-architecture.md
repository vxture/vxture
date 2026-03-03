# Architecture Overview

> **Project Type**: Enterprise Official Website
> **Architecture Style**: Lightweight Four-Layer Architecture
> **Version**: 2.0 (Finalized 2026-02-13)

---

## 1. Architectural Principles

This project follows a **lightweight four-layer architecture** to ensure:

- **Clear separation of concerns**: Each layer has a single, well-defined responsibility
- **Controlled dependency direction**: Dependencies flow in one direction only
- **Long-term maintainability**: Easy to understand, modify, and extend
- **Evolvability without over-engineering**: Appropriate complexity for an enterprise website

### What This Architecture Is

✅ **Content-driven enterprise website architecture**
✅ Lightweight implementation of Clean Architecture principles
✅ Optimized for official website scenarios (content management, SEO, i18n)
✅ Balanced between maintainability and simplicity

### What This Architecture Is NOT

❌ **Not a SaaS platform architecture**
❌ Not over-engineered with unnecessary abstractions
❌ Not designed for complex business workflows
❌ Not a microservices architecture

---

## 2. Top-Level Structure

```
packages/web/src/
│
├── app/                    # Framework Shell Layer (Next.js App Router)
├── presentation/           # UI Layer (React Components)
├── application/            # Use Case Layer (Business Orchestration)
├── domain/                 # Domain Layer (Business Models)
├── infrastructure/         # Infrastructure Layer (Data Sources)
├── stores/                 # Client State Layer (Zustand Stores)
└── shared/                 # Shared Utilities (Types, Constants, Utils)
```

### Directory Tree

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth routes group
│   ├── (main)/                    # Main routes group
│   │   ├── layout.tsx             # Main layout (with Header/Footer)
│   │   └── page.tsx               # Homepage
│   ├── about/                     # About page
│   ├── products/                  # Products page
│   ├── layout.tsx                 # Root layout (SSR)
│   └── globals.css                # Global styles
│
├── presentation/                  # UI Components
│   ├── components/
│   │   ├── home/                  # Homepage sections
│   │   ├── layout/                # Layout components (Header, Footer)
│   │   ├── about/                 # About page components
│   │   ├── products/              # Products page components
│   │   └── common/                # Shared UI components
│   └── styles/                    # Component styles
│
├── application/                   # Use Cases & Hooks
│   ├── hooks/                     # React Hooks
│   │   ├── homepage/              # Homepage hooks
│   │   ├── layout/                # Layout hooks
│   │   └── shared/                # Shared hooks
│   ├── usecases/                  # Use Cases
│   └── seo/                       # SEO logic
│
├── domain/                        # Domain Models
│   ├── homepage/                  # Homepage entities
│   │   ├── hero.model.ts
│   │   ├── features.model.ts
│   │   ├── homepage.aggregate.ts
│   │   └── homepage.repository.ts # Repository interface
│   ├── layout/                    # Layout entities
│   └── shared/                    # Domain shared
│       ├── exceptions/            # Domain exceptions
│       ├── repositories/          # Base repositories
│       └── types/                 # Domain types
│
├── infrastructure/                # Data Sources
│   ├── adapters/                  # External service adapters
│   │   ├── json/                  # JSON data adapter
│   │   ├── content/               # Content service
│   │   ├── i18n/                  # i18n service
│   │   └── theme/                 # Theme service
│   ├── repositories/              # Repository implementations
│   ├── mappers/                   # DTO ↔ Domain mappers
│   ├── clients/                   # HTTP clients
│   └── cache/                     # Cache management
│
├── stores/                        # Client State (Zustand)
│   ├── themeStore.ts              # Theme state
│   ├── i18nStore.ts               # i18n state
│   ├── authStore.ts               # Auth state
│   └── notificationStore.ts       # Notification state
│
└── shared/                        # Shared Utilities
    ├── types/                     # Shared types
    ├── constants/                 # Constants
    ├── utils/                     # Utility functions
    ├── theme/                     # Theme config
    └── contexts/                  # React contexts
```

---

## 3. Layer Responsibilities

---

### 3.1 app/ — Framework Shell Layer

**Purpose:**
Holds framework-level runtime structure. Acts as the entry point for Next.js App Router.

**Responsibilities:**

- ✅ Route definitions (`page.tsx`)
- ✅ Layout definitions (`layout.tsx`)
- ✅ Global provider mounting (`QueryProvider`, `ThemeProvider`)
- ✅ Metadata binding (SEO metadata)
- ✅ Server/client boundary control (`'use client'`, `'use server'`)

**Rules:**

- ❌ Must NOT contain business logic
- ❌ Must NOT access infrastructure directly
- ❌ Must NOT implement data fetching logic
- ✅ Only imports from `presentation/` layer

**Example:**

```tsx
// app/(main)/page.tsx
import HomePage from '@/presentation/pages/HomePage';

export default function Page() {
  return <HomePage />;
}
```

This layer acts only as the **runtime entry shell**.

---

### 3.2 presentation/ — UI Layer

**Purpose:**
Responsible for rendering the user interface.

**Responsibilities:**

- ✅ Page components (HomePage, AboutPage)
- ✅ Section components (HeroSection, FeaturesSection)
- ✅ Layout components (Header, Footer)
- ✅ UI interaction logic (event handlers, form validation)
- ✅ Pure rendering logic

**Can depend on:**

- `application/` (hooks, use cases)
- `shared/` (types, constants, utils)
- `stores/` (global state)

**Must NOT:**

- ❌ Access `infrastructure/` directly
- ❌ Access `domain/` directly
- ❌ Perform direct data fetching (use hooks from `application/`)
- ❌ Contain business orchestration logic

**Example:**

```tsx
// presentation/components/home/HeroSection.tsx
'use client';
import { useHero } from '@/application/hooks/homepage/useHero';

export default function HeroSection() {
  const { hero, isLoading } = useHero();

  if (isLoading) return <div>Loading...</div>;
  return <section>{hero.title}</section>;
}
```

This layer **renders data** but does not decide **how data is obtained**.

---

### 3.3 application/ — Use Case Layer

**Purpose:**
Coordinates page-level data and business orchestration.

**Responsibilities:**

- ✅ Use cases (GetHomepageContent, GetLayoutContent)
- ✅ Application hooks (useHomepage, useHeader)
- ✅ Data composition (combining multiple domain entities)
- ✅ Data transformation (DTO → ViewModel)
- ✅ Environment logic (client/server data fetching)
- ✅ SEO assembly (metadata generation)
- ✅ Multi-source coordination (JSON fallback → API)

**Can depend on:**

- `domain/` (models, repository interfaces)
- `infrastructure/` (repository implementations, adapters)
- `shared/` (types, constants, utils)

**Must NOT:**

- ❌ Contain UI components
- ❌ Render JSX
- ❌ Depend on `presentation/` layer
- ❌ Depend on `app/` layer

**Example:**

```ts
// application/hooks/homepage/useHero.ts
import { useQuery } from '@tanstack/react-query';
import { homepageRepository } from '@/infrastructure/repositories/homepage';
import { useI18nStore } from '@/stores/i18nStore';

export function useHero() {
  const locale = useI18nStore(s => s.locale);

  return useQuery({
    queryKey: ['hero', locale],
    queryFn: () => homepageRepository.getHero(locale),
  });
}
```

This layer **decides what data a page needs**.

---

### 3.4 domain/ — Domain Layer

**Purpose:**
Defines the shape and meaning of business data.

**Responsibilities:**

- ✅ Models (entities, value objects)
- ✅ Types (domain-specific types)
- ✅ Aggregates (business entity compositions)
- ✅ Repository contracts (interfaces only, no implementations)
- ✅ Domain rules (validation, business logic)
- ✅ Domain exceptions (ContentLoadError, ContentNotFoundError)

**Characteristics:**

- ✅ Pure TypeScript logic
- ❌ No framework code (React, Next.js)
- ❌ No `fetch`, no HTTP calls
- ❌ No UI code
- ❌ No external SDK dependencies

**Example:**

```ts
// domain/homepage/hero.model.ts
export interface HeroModel {
  id: string;
  title: string;
  description: string;
  cta: {
    text: string;
    link: string;
  };
}

// domain/homepage/homepage.repository.ts
export interface HomepageRepository {
  getHero(locale: string): Promise<HeroModel>;
  getFeatures(locale: string): Promise<FeaturesModel>;
}
```

This layer **defines what the system is**, not **how it works**.

---

### 3.5 infrastructure/ — Infrastructure Layer

**Purpose:**
Provides concrete data sources and external integrations.

**Responsibilities:**

- ✅ JSON adapters (read from `public/data/`)
- ✅ API clients (HTTP requests)
- ✅ CMS connectors (future: Strapi, Contentful)
- ✅ Repository implementations (implement `domain/` interfaces)
- ✅ Third-party SDK wrappers (analytics, tracking)
- ✅ Cache implementations (React Query, custom cache)
- ✅ Mappers (DTO ↔ Domain Model conversion)

**Can depend on:**

- `domain/` (implements repository interfaces)

**Must NOT:**

- ❌ Depend on `application/`
- ❌ Depend on `presentation/`
- ❌ Depend on `app/`
- ❌ Contain business logic (only technical implementations)

**Example:**

```ts
// infrastructure/repositories/homepage/HomepageRepository.ts
import { HomepageRepository } from '@/domain/homepage/homepage.repository';
import { JsonAdapter } from '@/infrastructure/adapters/json/JsonAdapter';
import { HeroMapper } from '@/infrastructure/mappers/homepage/HeroMapper';

export class HomepageRepositoryImpl implements HomepageRepository {
  async getHero(locale: string) {
    const dto = await JsonAdapter.load(`/data/pages/home/sections/hero.${locale}.json`);
    return HeroMapper.toDomain(dto);
  }
}

export const homepageRepository = new HomepageRepositoryImpl();
```

This layer answers: **where does the data come from?**

---

### 3.6 stores/ — Client State Layer

**Purpose:**
Manages client-side global state (UI state, not business data).

**Responsibilities:**

- ✅ UI state (theme, locale, modal visibility)
- ✅ Client synchronization state (theme sync, i18n sync)
- ✅ Transient state (notifications, toasts)
- ✅ User preferences (persisted to localStorage)

**Rules:**

- ❌ No domain logic
- ❌ No data persistence responsibility (use `infrastructure/` for API calls)
- ✅ Only UI-related state
- ✅ Use Zustand for state management

**Example:**

```ts
// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);
```

This layer manages **client-side UI state only**.

---

### 3.7 shared/ — Shared Utilities Layer

**Purpose:**
Holds cross-layer reusable utilities (no business logic).

**Responsibilities:**

- ✅ Constants (i18nConfig, themeConfig)
- ✅ Utility functions (pure functions: `formatDate`, `debounce`)
- ✅ Shared types (cross-layer TypeScript types)
- ✅ Context definitions (React Context boilerplate)
- ✅ Theme definitions (color maps, font configs)

**Rules:**

- ❌ No business logic
- ❌ No use case logic
- ❌ No infrastructure logic
- ✅ Pure functions only
- ✅ No dependencies on other layers

**Example:**

```ts
// shared/constants/i18nConfig.ts
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export const DEFAULT_LOCALE = 'zh-CN';

// shared/utils/scroll.ts
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
```

This layer provides **pure utilities** with **no dependencies upward**.

---

## 4. Dependency Direction (Strict Rule)

### Allowed Dependencies

```
app → presentation → application → domain
                                    ↑
                          infrastructure
                                    ↑
stores → shared                     │
                                    │
shared ────────────────────────────┘
```

### Dependency Flow Explanation

1. **app/** imports from **presentation/**
2. **presentation/** imports from **application/**, **stores/**, **shared/**
3. **application/** imports from **domain/**, **infrastructure/**, **shared/**
4. **domain/** imports from **shared/** only (no other dependencies)
5. **infrastructure/** imports from **domain/**, **shared/**
6. **stores/** imports from **shared/** only
7. **shared/** has **no dependencies** on any layer

---

## 5. Forbidden Dependencies

The following are **strictly prohibited**:

| Forbidden | Reason |
|-----------|--------|
| `domain → application` | Domain must not depend on use cases |
| `domain → presentation` | Domain must not depend on UI |
| `domain → infrastructure` | Domain defines interfaces, infrastructure implements them |
| `presentation → infrastructure` | UI must use application hooks, not direct data access |
| `presentation → domain` | UI must use application hooks, not direct domain models |
| `infrastructure → presentation` | Infrastructure must not depend on UI |
| `infrastructure → application` | Infrastructure must not depend on use cases |
| `application → presentation` | Use cases must not depend on UI |
| `app → domain` | App router must not directly access domain |
| `app → infrastructure` | App router must not directly access infrastructure |
| `stores → domain` | Stores must not contain business logic |
| `stores → application` | Stores must not depend on use cases |
| `shared → any layer` | Shared must remain pure and dependency-free |

---

## 6. Data Flow Example

### Complete Data Flow: Homepage Hero Section

```
1. User visits homepage
   ↓
2. [app/(main)/page.tsx] renders <HomePage />
   ↓
3. [presentation/pages/HomePage.tsx] renders <HeroSection />
   ↓
4. [presentation/components/home/HeroSection.tsx] calls useHero()
   ↓
5. [application/hooks/homepage/useHero.ts] calls homepageRepository.getHero()
   ↓
6. [infrastructure/repositories/homepage/HomepageRepository.ts] calls JsonAdapter
   ↓
7. [infrastructure/adapters/json/JsonAdapter.ts] reads public/data/pages/home/sections/hero.zh-CN.json
   ↓
8. [infrastructure/mappers/homepage/HeroMapper.ts] converts JSON DTO → HeroModel
   ↓
9. [application/hooks/homepage/useHero.ts] returns HeroModel
   ↓
10. [presentation/components/home/HeroSection.tsx] renders HeroModel
```

---

## 7. Design Philosophy

This architecture aims to:

1. **Keep structure stable**: Changes to UI don't affect domain logic
2. **Avoid premature SaaS-level abstraction**: No over-engineering for future scenarios
3. **Prevent architectural sprawl**: Each layer has clear boundaries
4. **Maintain clarity for a content-focused website**: Optimized for official website needs

### When Adding New Functionality

Always ask these three questions:

1. **Which layer does it belong to?**
   - UI logic → `presentation/`
   - Business orchestration → `application/`
   - Business rules → `domain/`
   - Data access → `infrastructure/`
   - UI state → `stores/`
   - Pure utilities → `shared/`

2. **Does it violate dependency direction?**
   - Check the dependency flow diagram
   - Ensure no forbidden dependencies

3. **Is it business logic or rendering logic?**
   - Business logic → `domain/` or `application/`
   - Rendering logic → `presentation/`

---

## 8. Content Data Management

### Data Source: JSON Files

```
public/data/
├── layout/
│   ├── header/
│   │   ├── header.zh-CN.json
│   │   └── header.en-US.json
│   └── footer/
│       ├── footer.zh-CN.json
│       └── footer.en-US.json
└── pages/
    └── home/
        └── sections/
            ├── hero.zh-CN.json
            ├── hero.en-US.json
            ├── features.zh-CN.json
            ├── features.en-US.json
            ├── solutions.zh-CN.json
            ├── solutions.en-US.json
            ├── cases.zh-CN.json
            ├── cases.en-US.json
            ├── cta.zh-CN.json
            └── cta.en-US.json
```

### Migration Path (Future)

```
Phase 1 (Current): Static JSON files
Phase 2 (Future):  API with JSON fallback
Phase 3 (Future):  Headless CMS (Strapi/Contentful)
```

The architecture supports this migration without changing `domain/` or `application/` layers.

---

## 9. Architecture Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Domain layer is pure TypeScript, easy to unit test
3. **Flexibility**: Can swap data sources without changing business logic
4. **Maintainability**: Clear boundaries make code easy to understand and modify
5. **Scalability**: Easy to add new features by extending existing layers

---

## 10. Common Pitfalls to Avoid

### ❌ Anti-Pattern 1: Direct Infrastructure Access in Presentation

```tsx
// ❌ BAD: presentation/components/home/HeroSection.tsx
import { JsonAdapter } from '@/infrastructure/adapters/json/JsonAdapter';

export default function HeroSection() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    JsonAdapter.load('/data/hero.json').then(setHero);
  }, []);

  return <div>{hero?.title}</div>;
}
```

```tsx
// ✅ GOOD: Use application hook
import { useHero } from '@/application/hooks/homepage/useHero';

export default function HeroSection() {
  const { hero, isLoading } = useHero();

  if (isLoading) return <div>Loading...</div>;
  return <div>{hero.title}</div>;
}
```

### ❌ Anti-Pattern 2: Business Logic in Presentation

```tsx
// ❌ BAD: presentation/components/home/FeaturesSection.tsx
export default function FeaturesSection() {
  const [features, setFeatures] = useState([]);

  // Business logic in UI component
  const filteredFeatures = features.filter(f => f.status === 'active');

  return <div>{filteredFeatures.map(...)}</div>;
}
```

```tsx
// ✅ GOOD: Business logic in application/domain
// application/hooks/homepage/useFeatures.ts
export function useFeatures() {
  const { data } = useQuery({
    queryKey: ['features'],
    queryFn: () => homepageRepository.getActiveFeatures(), // Business logic in repository
  });
  return { features: data };
}
```

### ❌ Anti-Pattern 3: Domain Depending on Infrastructure

```ts
// ❌ BAD: domain/homepage/hero.model.ts
import { JsonAdapter } from '@/infrastructure/adapters/json/JsonAdapter';

export class HeroModel {
  async load() {
    return JsonAdapter.load('/data/hero.json'); // Domain depending on infrastructure
  }
}
```

```ts
// ✅ GOOD: Domain defines interface, infrastructure implements
// domain/homepage/homepage.repository.ts
export interface HomepageRepository {
  getHero(locale: string): Promise<HeroModel>;
}

// infrastructure/repositories/homepage/HomepageRepository.ts
export class HomepageRepositoryImpl implements HomepageRepository {
  async getHero(locale: string) {
    return JsonAdapter.load(`/data/hero.${locale}.json`);
  }
}
```

---

## 11. Quick Reference

### Layer Checklist

| Layer | Can Import From | Cannot Import From | Purpose |
|-------|-----------------|-------------------|---------|
| **app/** | presentation | domain, infrastructure, application | Route definitions |
| **presentation/** | application, stores, shared | domain, infrastructure | UI rendering |
| **application/** | domain, infrastructure, shared | presentation, app | Business orchestration |
| **domain/** | shared | all other layers | Business models |
| **infrastructure/** | domain, shared | application, presentation, app | Data sources |
| **stores/** | shared | all other layers | Client state |
| **shared/** | none | all layers | Pure utilities |

### File Naming Conventions

| Layer | File Pattern | Example |
|-------|-------------|---------|
| **domain/** | `*.model.ts`, `*.aggregate.ts`, `*.repository.ts` | `hero.model.ts`, `homepage.aggregate.ts` |
| **infrastructure/** | `*Repository.ts`, `*Adapter.ts`, `*Mapper.ts` | `HomepageRepository.ts`, `JsonAdapter.ts` |
| **application/** | `use*.ts`, `Get*.ts` | `useHero.ts`, `GetHomepageContent.ts` |
| **presentation/** | `*.tsx` | `HeroSection.tsx`, `Header.tsx` |
| **stores/** | `*Store.ts` | `themeStore.ts`, `i18nStore.ts` |
| **shared/** | `*.ts`, `*.types.ts`, `*.config.ts` | `scroll.ts`, `content.types.ts` |

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-06-01 | Initial architecture definition |
| 2.0 | 2026-02-13 | Finalized version with detailed guidelines, data flow examples, and anti-patterns |

---

## 13. Related Documentation

- [Directory Structure Reference](./packages/web/ARCHITECTURE_STRUCTURE.md) - Detailed directory tree and examples
- [Domain Layer Documentation](./packages/web/src/domain/README.md) - Domain models and repository interfaces
- [Infrastructure Layer Documentation](./packages/web/src/infrastructure/README.md) - Adapters and repository implementations
- [Application Layer Documentation](./packages/web/src/application/README.md) - Hooks and use cases

---

**Architecture Version**: 2.0 (Finalized)
**Project Type**: Enterprise Official Website
**Complexity Target**: Lightweight & Maintainable
**Last Updated**: 2026-02-13
**Maintainer**: vxture team

---

End of Document
