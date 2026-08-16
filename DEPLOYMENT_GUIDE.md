# 🚀 Swipetern Deployment Guide: Local & Production Setup

This guide provides step-by-step instructions on how to run, build, and deploy the **Swipetern** mutual-consent matchmaking platform locally and in production cloud environments.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Local Setup (Python & Node.js Environment)](#-local-setup-python--nodejs-environment)
3. [Local Containerized Setup (Docker & Docker Compose)](#-local-containerized-setup-docker--docker-compose)
4. [Database & Supabase Configuration](#-database--supabase-configuration)
5. [Production Deployment (Vercel Cloud Deployment)](#-production-deployment-vercel-cloud-deployment)
6. [Testing & Verification](#-testing--verification)

---

## 🛠️ Prerequisites

Ensure your system has the following installed before proceeding:
- **Python**: Version 3.12 or higher
- **Node.js**: Version 18.x or higher & `npm`
- **Docker & Docker Compose** *(Optional, for containerized local execution)*
- **Git**

---

## 💻 Local Setup (Python & Node.js Environment)

### Step 1: Clone the Repository & Navigate to Directory
```bash
git clone https://github.com/your-username/swipetern.git
cd swipetern
```

### Step 2: Set Up Python Virtual Environment
```bash
# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install required Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Install Frontend Node Dependencies & Compile CSS
```bash
# Install Node.js dependencies (Tailwind CSS, etc.)
npm install

# Compile Tailwind CSS styles
npm run build
```

### Step 4: Run the Development Server
```bash
# Start the FastAPI backend & serve static SPA frontend on port 8000
PYTHONPATH=. python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

> 🌐 **Access Application:** Open your browser and navigate to `http://127.0.0.1:8000`.

---

## 🐳 Local Containerized Setup (Docker & Docker Compose)

To run the application inside an isolated Docker container:

### Step 1: Build & Start Containers
```bash
docker compose up --build -d
```

### Step 2: Verify Running Containers
```bash
docker compose ps
```

> 🌐 **Access Application:** Open `http://localhost:8080` in your browser (Port 8080 maps to internal container port 8000).

### Step 3: Stop Container Stack
```bash
docker compose down
```

---

## 🗄️ Database & Supabase Configuration

Swipetern is configured to run out-of-the-box with **SQLite** for local development and support **PostgreSQL / Supabase** for scaled production.

### Setting up Supabase Migrations
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `/supabase/migrations/20260805000000_swipetern_schema.sql` into the editor and click **Run**.
4. Retrieve your Supabase URL and Anon Key from **Project Settings -> API**.
5. Set environment variables in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SECRET_KEY=swipetern-production-secret-key
```

---

## ☁️ Production Deployment (Vercel Cloud Deployment)

Swipetern includes a native root-level `vercel.json` configured for serverless deployment.

### Step 1: Install Vercel CLI & Authenticate
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy to Production
```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

### Step 3: Configure Environment Variables in Vercel Dashboard
In your Vercel project dashboard under **Settings -> Environment Variables**, add:
- `SECRET_KEY`: A secure random cryptographic key for signing HMAC session tokens.

---

## 🧪 Testing & Verification

### Running Backend Unit & Integration Tests
```bash
PYTHONPATH=. pytest backend/tests/test_backend.py
```

### Running Visual End-to-End Verification (Playwright)
```bash
python3 /home/jules/verification/verify_swipetern_flow.py
```

---

*© 2026 Swipetern Inc. All rights reserved.*
