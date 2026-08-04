# 🗺️ Swipetern MVP: Master Blueprint & Generative AI Prompts

This Master Blueprint outlines the sequential, system-by-system development tasks and copy-pasteable generative AI prompts required to construct the fully persistent **Swipetern MVP Web Application** (connecting East African employers with global student interns).

---

## 📖 Table of Contents
1. [Core Architectural Overview](#-core-architectural-overview)
2. [Task List 1: The Front-ground (UI/UX Layer)](#-task-list-1-the-front-ground-uiux-layer)
3. [Task List 2: The Middle-ground (API & Validation Layer)](#-task-list-2-the-middle-ground-api--validation-layer)
4. [Task List 3: The Back-ground (Data Infrastructure Layer)](#-task-list-3-the-back-ground-data-infrastructure-layer)
5. [🤖 Generative AI Prompts Manifest](#-generative-ai-prompts-manifest)

---

## 🏗️ Core Architectural Overview

The Swipetern MVP is structured into three decoupled layers:

```
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. THE FRONT-GROUND (Tailwind CSS, Vanilla ES6, Chart.js)   │
  │    - Brand-aligned unauth Explainer Page first             │
  │    - Interactive in-memory sandbox (no login required)      │
  │    - Auth-gated live SQLite matching & chat workspace       │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTP REST (JSON + Cookie)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. THE MIDDLE-GROUND (FastAPI Routing & Stateless JWT/HMAC) │
  │    - Cryptographic HMAC-signed session validation (Vercel)  │
  │    - Pydantic v2 data structure validation & strict parsing  │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ SQLAlchemy ORM Transactions
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. THE BACK-GROUND (SQLAlchemy, SQLite Relational Database) │
  │    - Native SQLite foreign key constraint enforcement       │
  │    - Expanded Cohort Manifest seed and analytical events   │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Task List 1: The Front-ground (UI/UX Layer)

These tasks govern the client-side single-page application (SPA), responsive layouts, and interactive gesture handling.

### 📋 Front-ground Tasks
- [ ] **Task 1.1: Brand-Aligned Explainer Landing Page**
  - Implement the first default unauthenticated screen (`screen-explainer`) introducing Swipetern's value proposition, the Global-to-East Africa corridor, and our official relocations partner, **Admas Afrolink**.
- [ ] **Task 1.2: Mobile-First Sandbox Simulation Deck**
  - Build an unauthenticated interactive sandbox (`screen-landing`) pre-populated with 6 candidate and 5 opportunity cards.
  - Apply `touch-action: pan-y` and `user-select: none` to swipe cards to avoid conflicts with WebKit horizontal scroll events.
- [ ] **Task 1.3: Animated Celebration Overlay**
  - Construct a full-screen "Vibe Check Passed" modal celebration triggered upon reciprocal swipes. Ensure smooth scale-in animations using hardware-accelerated CSS properties.
- [ ] **Task 1.4: Multi-Tab Live Workspace**
  - Create the authenticated workspace layout featuring sidebar navigation, active deck swiping, direct messaging, compliance trackers, analytics, and admin safety control centers.
- [ ] **Task 1.5: High-Contrast Chart.js Engagement**
  - Programmatically wrap and split Chart.js labels exceeding 16 characters on word boundaries to protect mobile viewports.
  - Implement a custom tooltip callback override on `callbacks.title` to reconstruct and display the full title on hover.

---

## ⚙️ Task List 2: The Middle-ground (API & Validation Layer)

These tasks govern endpoint routing, input sanitization, and serverless-friendly session management.

### 📋 Middle-ground Tasks
- [ ] **Task 2.1: Stateless Session Token Signing**
  - To support stateless environments like Vercel, replace local server in-memory stores with cryptographic HMAC-SHA256 signed session tokens (`f"{user_id}.{signature}"`) with timing-attack-proof `hmac.compare_digest` validation.
- [ ] **Task 2.2: Strict CORS Middleware Configuration**
  - Set explicit `allow_origins` (local development ports) and `allow_origin_regex` for all `https://*.vercel.app` preview URLs to satisfy the strict FastAPI constraint prohibiting `"*"` wildcards when `allow_credentials=True`.
- [ ] **Task 2.3: Pydantic Data Structures**
  - Map complete input/output Pydantic v2 schemas (`schemas.py`) for users, profiles, opportunities, swipes, chats, and reports.
- [ ] **Task 2.4: Input Sanitization**
  - Sanitize all incoming user chat messages and bio text elements on both backend storage and frontend display elements to completely eliminate Cross-Site Scripting (XSS) vectors.

---

## 🗄️ Task List 3: The Back-ground (Data Infrastructure Layer)

These tasks govern database tables, relational integrity, migrations, and seed manifest.

### 📋 Back-ground Tasks
- [ ] **Task 3.1: SQLite Relational Schema**
  - Map SQLAlchemy models (`models.py`) with complete cascade deletion paths for users, profiles, opportunities, swipes, matches, compliance records, reports, and events.
- [ ] **Task 3.2: Native Foreign Key Enforcement**
  - Configure SQLAlchemy's SQL compilation pool to issue `PRAGMA foreign_keys=ON` automatically on database connection establishment, guaranteeing database-level referential integrity.
- [ ] **Task 3.3: Expanded Cohort Seeding Manifest**
  - Write database seed operations to populate the persistent database with the full cohort edition on startup (including Emma, Lucas, Marie, Derrick, Florence, Nils, Jibu, and SafeBoda).

---

## 🤖 Generative AI Prompts Manifest

Utilize these highly detailed, context-aware prompts in generative AI models (like ChatGPT, Claude, Gemini, or v0) to write exact components for the Swipetern MVP.

### 💡 1. Front-ground (UI/UX) Generation Prompt

```text
Write a single-file, highly responsive index.html and static asset script utilizing Tailwind CSS, FontAwesome 6, and Chart.js.

The page must conform strictly to the following parameters:
1. THE DEFAULT VIEW must be an Explainer Landing Screen (screen-explainer) outlining the What, Why, and How Swipetern connects Europe/North American interns with East African (Uganda, Kenya, Rwanda) employers. Explicitly credit "Admas Afrolink" as the official relocations, visa, and immigration clearance partner. Provide two prominent call-to-actions (CTAs): "Enter Interactive Sandbox (No Sign Up)" and "Claim Account / Log In".
2. INTERACTIVE SANDBOX: If they enter the sandbox, render a high-fidelity swipe card deck, mutual matches list, chat thread simulator with quick responses (e.g. Google Meet scheduling, ECTS co-op signoff), and a Departure checklist. The deck must support pan-y touch-action, be fully keyboard navigable, and utilize hardware-accelerated CSS transforms.
3. ESTHETICS: Implement the "UI/UX Pro Max v2.0" token matrix: Core background #020617 (Slate 950), card background #0f172a (Slate 900), borders #334155 (Slate 700), brand accents #d946ef (fuchsia) and #6366f1 (indigo). Avoid raw hex colors; utilize CSS variables or Tailwind classes.
4. ACCESSIBILITY: Visible focus rings (ring-offset-2 ring-fuchsia-500) and custom aria-labels on all icon-only buttons. All touch targets must be at least 44x44px. Do not use emojis as primary interface icons; replace them with FontAwesome icons.
5. CHART.JS: In the analytics section, render Customer Acquisition Cost (CAC) vs. LTV and TAM/SAM/SOM segmentation charts. Ensure any labels exceeding 16 characters are programmatically split on word boundaries, and override the tooltip callbacks.title configuration to display full labels.
6. SECURITY: Sanitize all chat messages and bio text to neutralize Cross-Site Scripting (XSS).
```

### 🧠 2. Middle-ground (API & Validation) Generation Prompt

```text
Write a FastAPI (Python 3.12) backend router and middleware configuration that serves as a highly secure, serverless-friendly API layer.

The code must conform strictly to the following parameters:
1. STATELESS SESSIONS: Do not use in-memory dictionaries for session storage, as Vercel runs on stateless ephemeral containers. Instead, implement cryptographic HMAC-SHA256 signed session tokens ("user_id.signature"). Use hmac.compare_digest for timing-attack protection.
2. PASSWORD STORAGE: Hash passwords securely using the standard library's PBKDF2 with SHA-256 and a dynamically generated salt, executing 100,000 iterations. Provide a safe fallback for old SHA-256 hashes.
3. CORS RULES: FastAPI prohibits allow_origins=["*"] when allow_credentials=True. Define an explicit array of allowed local development origins (localhost, 127.0.0.1, 8080, 8000) and set allow_origin_regex="https://.*\\.vercel\\.app" to support Vercel preview deploys securely.
4. SCHEMAS: Write complete Pydantic v2 schemas for UserRegister, UserLogin, ProfileUpdate, OpportunityCreate, SwipeCreate, MessageCreate, ComplianceUpdate, and ReportCreate, enforcing strict type validations.
```

### 🗄️ 3. Back-ground (Data Infrastructure) Generation Prompt

```text
Write a SQLAlchemy (SQLite) database module and repository layer for Swipetern.

The code must conform strictly to the following parameters:
1. MODELS: Map relational tables for User, Profile, Opportunity, Swipe, Match, ComplianceRecord, Message, Report, and AnalyticsEvent, with cascaded deletion paths.
2. FOREIGN KEYS: On SQLite, foreign key constraints are disabled by default. You MUST write an event listener using @event.listens_for(Engine, "connect") that executes "PRAGMA foreign_keys=ON" on pool connections to enforce relational integrity at the database level.
3. SEEDING MANIFEST: Pre-populate the SQLite database with the full cohort edition of seed data (Emma, Lucas, Marie, Derrick, Florence, Nils, and associated opportunities at Phynx Tech, Enum Agribusiness, Kampala Clinic, Jibu Water Rwanda, and SafeBoda) so the application is ready-to-run with analytics and moderation logs instantly.
```
