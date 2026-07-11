# ⚡ Swipetern: Mutual-Consent Internship Matching Platform

Swipetern is a high-performance, full-stack platform designed to connect **students** and **employers** through intuitive mutual-consent matching (swipe mechanics), followed by direct chat communications and lightweight pre-hire compliance tracking.

---

## 📖 Table of Contents
1. [What is Swipetern?](#-what-is-swipetern)
2. [Why was it built?](#-why-was-it-built)
3. [Who is it for?](#-who-is-it-for)
4. [When should it be used?](#-when-should-it-be-used)
5. [How does it work?](#-how-does-it-work)
6. [System Architecture](#-system-architecture)
7. [Running & Testing Locally](#-running--testing-locally)
8. [Deployment Guide](#-deployment-guide)

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

## 🏗️ System Architecture

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

#### 2. Manual Docker Container Build
Build and run the Docker image manually:
```bash
docker build -t swipetern:latest .
docker run -d -p 8000:8000 --name swipetern_app --env DATABASE_URL="sqlite:///./swipetern.db" swipetern:latest
```

### Method B: Deploying to Heroku / Render / Railway
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
