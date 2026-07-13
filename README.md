# ⚡ Swipetern: Mutual-Consent Internship Matching Platform

Swipetern is a high-performance, full-stack platform designed to connect **students** and **employers** through intuitive mutual-consent matching (swipe mechanics), followed by direct chat communications and lightweight pre-hire compliance tracking.

---

## 📖 Table of Contents
1. [What is Swipetern?](#-what-is-swipetern)
2. [Why was it built?](#-why-was-it-built)
3. [The Deeper Purpose & Spiritual Connection](#-the-deeper-purpose--spiritual-connection)
4. [Who is it for?](#-who-is-it-for)
4. [When should it be used?](#-when-should-it-be-used)
5. [How does it work?](#-how-does-it-work)
6. [System Architecture & OOP Design](#-system-architecture--oop-design)
7. [Role Privileges](#-role-privileges)
8. [Running & Testing Locally](#-running--testing-locally)
9. [Deployment Guide](#-deployment-guide)

---

## 🔍 What is Swipetern?
**Swipetern** is a modern, responsive web application implementing a "swipe-to-match" paradigm for the internship and co-op recruiting market.
Instead of sending countless resume applications into a black hole, students discover internship positions, and employers discover student candidates, by scrolling through curated cards.
When both parties swipe "LIKE" on each other, a **Mutual Match** is instantly created. This unlocks an integrated **Live Chat room** and an interactive **Compliance Tracker checklist** to transition candidates from "match" to "ready to onboard."

---

## 🎯 Why was it built?
Traditional recruitment tools suffer from three main drawbacks:
1. **Low Response Rates:** Candidates apply to hundreds of roles with zero feedback, while employers are flooded with unqualified resumes.
2. **Insecure & Fragmented Comms:** Conversations move between email, LinkedIn, and external messaging apps, making tracking difficult.
3. **Delayed Compliance:** Crucial legal and academic parameters (such as student visa statuses, co-op university credits, and passport validations) are checked too late, resulting in rescinded offers.

**Swipetern solves this** by establishing:
- **Mutual-Consent Discovery:** Restricts chats to mutual likes, eliminating cold spam and ensuring high intent.
- **Embedded Compliance Workflow:** Integrates verification checks (School Co-op Approval, Visa, Travel Docs, and Interview Progress) directly alongside the chat room, calculating a dynamic **onboarding readiness** status.

---

## 🌌 The Deeper Purpose & Spiritual Connection

At its heart, **Swipetern** is more than just a matching tool—it is a digital bridge built to honor human dignity, alignment, and shared purpose.

### 🌟 Why This Matters: Beyond the Cold Transaction
Traditional recruitment treats candidates as data points and resumes as commodities, leading to alienation and despair. Swipetern rejects this clinical, one-sided dynamic. By enforcing **Double Opt-In Mutual Consent**, we ensure that every connection is initiated from a place of reciprocal interest and mutual respect. This shifts the onboarding flow from a forced transaction to a **creative partnership**.

### 🤝 The Spiritual Alignment: Seeker and Guide
In ancient traditions, the transition from student to practitioner was considered a sacred journey. Swipetern honors this lineage by modeling internships not as cheap labor, but as a relational bond between a **Seeker (the Student)** and a **Guide (the Employer)**:
- **Resonance over Noise:** By blocking unsolicited cold messaging, both student and recruiter can focus their cognitive energy only on connections that share a genuine resonance.
- **Unified Checklist Journey:** The integrated Departure Hub checklist (incorporating visa status, co-op validations, and scheduling) is designed as a shared ritual. Instead of a bureaucratic hurdle, checking off milestones becomes a collaborative milestone-tracking game where both parties help each other succeed.
- **Safety and Respect as a Core Pillar:** In protecting vulnerable student seekers, our community moderation safeguards represent a sacred boundary. Abusive or deceptive behaviors are processed with absolute zero-tolerance, nurturing a digital ecosystem built on trust, honesty, and safety.

By treating the recruitment journey as a shared human exploration, Swipetern turns early-career job placement into an empowering, mindful adventure.

---

## 👥 Who is it for?
- **🎓 Students:** University and college students looking for co-op terms, summer internships, or graduate roles. They can easily showcase their skills, academic history, visa availability, and target job titles.
- **🏢 Employers & HR Managers:** Companies seeking to recruit fresh student talent. They can create job postings, outline required skillsets, swipe through qualified student candidates, and verify compliance requirements.
- **🛡️ Administrators:** Platform moderators who review flagged reports, manage user deactivations, and ensure community guidelines are strictly respected.

---

## 📅 When should it be used?
- **Recruitment Cycles:** During active fall, spring, and summer internship hiring windows.
- **Co-op Matching Periods:** When universities host automated matching periods for co-op terms.
- **Pre-Onboarding Compliance:** Once a match is made, to continuously track legal and administrative progress before drawing up the employment contract.

---

## ⚙️ How does it work?

### 1. Account Creation & Onboarding
- Users register with their email, password, and chosen role (`student` or `employer`).
- On first login, they are directed to a specialized onboarding form:
  - **Students** specify name, bio, education, skills, target roles, and work authorization (visa) status.
  - **Employers** specify HR name, company name, bio, industry, and can post active internship listings ("Opportunities").

### 2. Double-Blind Swipe Matching
- **Student View:** A card deck of active employer opportunities. Swiping **LEFT (Pass)** discards the card; swiping **RIGHT (Like)** expresses interest.
- **Employer View:** A card deck of onboarded student profiles. They swipe left/right to pass/like.
- **Mutual Match Trigger:** If an employer likes a student who liked one of the employer's opportunities, an instant **Match Popup Modal** opens, announcing the match.

### 3. Integrated Chat & Compliance
- Matching instantiates an isolated **Direct Message Chat Room**.
- A side panel renders the **Compliance Tracker widget**.
- Either party can update the status of individual items:
  - **School Co-op Approval** (Pending / Approved / Rejected)
  - **Visa & Work Permit** (Pending / Approved / Not Needed / Rejected)
  - **Travel Documents** (Pending / Approved / Rejected)
  - **Interview Progress** (Checkbox Done / Scheduled)
- Once all required steps are approved and checked, the match is dynamically promoted to **Ready / Compliant (100% Onboarding Readiness)**.

### 4. Moderation & Trust
- Users can flag/report other matched users for suspicious or abusive behavior.
- Administrators review reports in real-time in the **Safety & Moderation Center** and can warn or suspend offenders instantly.

---

## 🏗️ System Architecture & OOP Design

### 1. High-Level Architecture
The platform is designed with a lightweight, secure, and production-ready decoupled architecture:

```
                  ┌───────────────────────────────────────────┐
                  │          Tailwind CSS / ES6 SPA           │
                  │             (Web Frontend)                │
                  └──────┬─────────────────────────────▲──────┘
                         │                             │
             REST API    │  HTTP Requests              │ Polling / Real-time Updates
             (JSON)      │                             │
                         ▼                             │
                  ┌────────────────────────────────────┴──────┐
                  │         FastAPI (ASGI Backend)            │
                  │      - Auth: JWT/Session Cookie           │
                  │      - Router Engine                      │
                  └──────┬─────────────────────────────▲──────┘
                         │                             │
            SQLAlchemy   │  Queries                    │ Writes
            ORM          │                             │
                         ▼                             │
                  ┌────────────────────────────────────┴──────┐
                  │          SQLite Database File             │
                  │            (swipetern.db)                 │
                  └───────────────────────────────────────────┘
```

- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, Pydantic, Pytest.
- **Database:** SQLite with full foreign key constraint enforcement listener.
- **Frontend:** Vanilla ES6 Javascript, HTML5, Tailwind CSS via CDN, and FontAwesome icons.
- **E2E Testing:** Playwright (Chromium headless browser) for automated interaction flow, screenshots, and video verification.

---

### 2. Object-Oriented Programming (OOP) Approach
Swipetern implements standard object-oriented principles to model domains, encapsulate internal application states, and structure business logic clearly. Each primary domain concept is mapped to specific logical components or database models.

#### 🧩 Suggested Classes & Core Domain Concepts

- **`User` (Base Class):**
  - Represents the base structure for standard system access. Houses core capabilities including authentication, credential hashing, session management, dynamic activity checking (`is_active`), and notification hooks.
- **`StudentUser` (Extends `User`):**
  - Specializes the user with capabilities to browse target opportunities, execute swipes, and manage their personal internship-focused portfolio.
- **`EmployerUser` (Extends `User`):**
  - Specializes the user with capabilities to create and manage dynamic internship opportunity listings, browse student candidate cards, and record swipes.
- **`Profile`:**
  - Manages and encapsulates core role-specific user details (including skill vectors, university credentials, industry fields, etc.).
- **`Opportunity`:**
  - Represents a specific internship or co-op opening hosted by an employer containing target skillsets and details.
- **`CandidateProfile`:**
  - A contextual view representing a student profile formatted specifically for employer evaluation decks.
- **`SwipeEvent`:**
  - Standard model tracking specific raw directional interactions (`like` / `pass`) between swipers and swipe-targets.
- **`Match`:**
  - Represents a verified mutual connection triggered when a student and employer mutually express interest. It acts as the anchor for secondary engagement.
- **`ChatRoom`:**
  - Manages, routes, and archives dynamic direct messages between mutually matched users.
- **`ComplianceRecord`:**
  - Tracks onboarding requirements, tracks verification status across checklist steps, and computes real-time candidate readiness.
- **`Report`:**
  - Stores user reports and flagged behaviors submitted to moderation queues.

#### ⚙️ OOP Principles Applied

- **Encapsulation:**
  Internal state variables (such as password digests, deactivation controls, and session authorization statuses) are securely encapsulated inside model instances and validation schemas, protecting raw fields from unauthorized external manipulation.
- **Inheritance:**
  The common attributes of system accounts (e.g., authentication, registration date, activation statuses) are cleanly defined in the parent `User` class, which is then extended to build specialized student and employer profiles.
- **Abstraction:**
  Complex internal logic—such as evaluating matching criteria, computing compliance scoring, and handling user warnings—is simplified into straightforward logical actions (`login()`, `swipe()`, `sendMessage()`, `updateCompliance()`) exposed through clean RESTful interfaces.
- **Polymorphism:**
  Allows role-based specialization of shared functions. For example, the action of retrieving a swipe discovery deck (`viewFeeds()`) polymorphicly outputs Opportunity Cards for students and Candidate Cards for employers.

---

## 🛡️ Role Privileges

Swipetern enforces a precise, state-based role hierarchy to guarantee complete security boundary separation across users.

### 🎓 Student Privileges
- **Profile Management:** Create, configure, and dynamically update their own skills, education, target roles, and visa status.
- **Discovery:** Retrieve custom job opportunities, filter listings, and skip/swipe on active openings.
- **Matching & Chat:** Participate in interactive text communication with employers after a successful mutual-consent match.
- **Compliance Integration:** View the pre-hire compliance requirements checklist and update their personal status items when requested.

### 🏢 Employer Privileges
- **Profile & Post Management:** Create/edit employer info, and publish, activate, or deactivate specific internship opportunities.
- **Discovery:** Browse and swipe through standard candidate profiles matching target internship needs.
- **Matching & Chat:** Directly chat with students once a mutual connection is verified.
- **Compliance Oversight:** Review and approve compliance checkpoints (e.g., School Co-op Approval, Visa, Travel Docs) for matched candidates to monitor overall hiring readiness.

### 👑 Admin Privileges
- **Moderation Dispatch:** Access a dedicated, real-time Safety & Moderation Center to inspect submitted user abuse reports.
- **User Penalties:** Issue warnings, suspend users, or completely deactivate malicious profiles.
- **Analytics & Platform Health:** View an aggregated analytics dashboard tracking global swipe activity, match ratios, user ratios, and critical platform-wide events.

---

## 🚀 Running & Testing Locally

### Prerequisites
- Python 3.12+
- pip (Python package installer)

### 1. Installation & Environment Setup

Clone this repository and set up a clean Python virtual environment:

**Create and Activate Virtual Environment:**
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows (Command Prompt):
```cmd
python -m venv venv
venv\Scripts\activate
```

On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Install Dependencies:**
With the virtual environment active, install all required dependencies using the `requirements.txt` file:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Run Database Migrations & Start Server
FastAPI automatically bootstraps and compiles the SQLite database tables on startup. Start the development server using:
```bash
PYTHONPATH=. python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
The application will be live at: **`http://127.0.0.1:8000`**

### 3. Running Unit and Integration Tests
Execute the comprehensive Pytest suite:
```bash
PYTHONPATH=. pytest backend/tests/test_backend.py
```

### 4. Automated Frontend E2E Verification
Our automated Playwright verification script clears database states, starts a mock run, handles student & employer onboarding, executes a swipe match, sends chat messages, completes the compliance checklist, and outputs screenshots/videos:
```bash
python3 /home/jules/verification/verify_swipetern.py
```
- **Screenshots:** Placed in `/home/jules/verification/screenshots/`
- **Video Recordings:** Placed in `/home/jules/verification/videos/`

---

## 🚢 Deployment Guide

Swipetern is fully packaged and ready to deploy to production. Below are the steps for standard containerized or platform-as-a-service (PaaS) clouds:

### Method A: Docker Container & Compose Deployment (Recommended)

#### 1. Running with Docker Compose
We provide a pre-configured `docker-compose.yml` file to get the service running instantly with hot-reloading capability for easier local development.

Start the application container with:
```bash
docker compose up --build -d
```
- Access the app at: **`http://localhost:8000`**
- Stop the application using:
```bash
docker compose down
```

#### 💡 Troubleshooting: Port Already Allocated Error
If you receive an error stating:
`Bind for 0.0.0.0:8000 failed: port is already allocated`

This means another process (such as a local Uvicorn development server) is already running on port `8000`. You can resolve this in one of two ways:

1. **Stop the conflicting process:**
   Find and terminate the process bound to port `8000`:
   ```bash
   kill $(lsof -t -i :8000) 2>/dev/null || true
   ```

2. **Change the external port binding:**
   Open `docker-compose.yml` and change the outer port mapping from `"8000:8000"` to an alternative port (such as `"8080:8000"`):
   ```yaml
   ports:
     - "8080:8000"
   ```
   Now, you can access the application inside the container at **`http://localhost:8080`**.

#### 2. Manual Docker Container Build
Build and run the Docker image manually:
```bash
docker build -t swipetern:latest .
docker run -d -p 8000:8000 --name swipetern_app --env DATABASE_URL="sqlite:///./swipetern.db" swipetern:latest
```

### Method B: Deploying to Vercel (swipetern.vercel.app)
Swipetern is fully optimized for zero-configuration, lightning-fast deployment on Vercel utilizing Serverless Functions (Python runtime) and Static Asset CDN.

We have preconfigured a `vercel.json` file in the root directory to handle automated routing between the frontend single-page application and the FastAPI serverless backend.

#### 1. Quick Deploy via Vercel CLI
Ensure you have the Vercel CLI installed, then log in and deploy:
```bash
npm install -g vercel
vercel login
vercel
```

#### 2. Connect Your Git Repository
Alternatively, connect your repository to Vercel via the Vercel Dashboard:
- Choose the repository of your project.
- Vercel automatically detects the `vercel.json` configuration and builds your frontend & backend as serverless functions.
- Add an environment variable `DATABASE_URL` under your Project Settings: `sqlite:///./swipetern.db` (or connect to a remote serverless PostgreSQL instance).
- Your application will be live at: **`https://swipetern.vercel.app`**

---

### Method C: Deploying to Heroku / Render / Railway
1. **Requirements:** Create a `requirements.txt` file:
   ```text
   fastapi>=0.110.0
   uvicorn>=0.28.0
   sqlalchemy>=2.0.0
   pydantic>=2.6.0
   email-validator>=2.1.0
   ```
2. **Procfile:** For Heroku/Render, add a `Procfile` in the root:
   ```text
   web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
3. **Environment Variables:**
   - Set `DATABASE_URL` (e.g. `sqlite:///./swipetern.db` or connect to a production PostgreSQL database instance).
   - Platform automatically binds the `$PORT` environment variable.

### Production Security Hardening Checklist
- [ ] **HTTPS Enforced:** Direct all web traffic over HTTPS (SSL/TLS).
- [ ] **Production DB:** Switch from local SQLite file (`swipetern.db`) to a managed database like AWS RDS PostgreSQL.
- [ ] **Secure Cookies:** In production, set the session cookie to `Secure=True` and `SameSite=Strict`.
- [ ] **Disable Admin Backdoor:** Ensure the quick mock admin buttons are omitted or gated behind admin security credentials.
