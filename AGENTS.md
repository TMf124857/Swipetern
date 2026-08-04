# AGENTS.md — Swipetern Repository Context & Rules of Engagement

This file contains crucial architectural constraints, database schemas, and codebase guidelines for Google's Jules Autonomous Coding Agent (jules.google). Refer to these rules before planning or executing any file modifications, bug fixes, or feature additions in this repository.

## 1. Project Overview & Ideology

Swipetern is a standalone, mobile-first, mutual-consent matchmaking platform connecting Gen Z candidates with global early-career internships.

The Tinder Mechanic: A candidate and an employer must both swipe "Right" (Like) on each other to establish a match.

Stand-Alone Workflow: No dependencies on bloated legacy enterprise architectures. Real-time matching, instant messaging, and departure checklists are handled via native serverless micro-interactions.

## 2. Tech Stack & Directories

Frontend Framework: React (Vite-based SPA) or clean semantic HTML5.

Styling & UI: Tailwind CSS (Utility-first classes) and Lucide Icons.

State Management: React hooks tracking interactive touch swipes, matching popups, and real-time active message lists.

Visual Data Engagements: Chart.js (Dual Bar, Polar Area, Area Line charts) for financial analysis.

Database & Auth: Firebase SDK (Firestore Document Store & Anonymous/Federated Auth).

## 3. Strict Database Rules (To Prevent Permission Errors)

Jules must strictly follow the collection path hierarchies defined below to respect security rules.

### A. Firestore Path Hierarchy

Public Shared Matching Pools & Messaging:

Path format: `artifacts/{appId}/public/data/{collectionName}/{documentId}`

Allowed collection values for `collectionName`:

- `matches` (Stores mutual-consent match certificates)
- `chats` (Stores bidirectional messaging documents with message lists)

Private User-Specific Data:

Path format: `artifacts/{appId}/users/{userId}/{collectionName}/{documentId}`

Allowed collection values for `collectionName`:

- `swipes` (Actor decisions: swipe right or left on target profiles)

### B. Firestore Query Restrictions (Zero-Index Fallback)

To avoid requiring complex, custom index declarations in the Google Firebase console (which can cause silent client crashes during production runs):

- Never use Firestore `orderBy()` or `limit()` clauses.
- Never compile composite/multi-condition `where()` clauses.
- Requirement: Fetch flat records using simple, un-nested `collection()` queries, and perform sorting, filtering, and capping safely inside React state-memory arrays.

## 4. UI/UX & Responsive Guardrails

- **The Single-File Mandate:** For demo prototypes and single-file templates, keep all HTML, JavaScript logic, and Tailwind styles in `index.html`.
- **Gesture-Native Design:** Interactive cards must dynamically support both mouse clicks (for desktop preview testing) and native mobile touch events (`touchstart`, `touchmove`, `touchend`) to fit Gen Z's mobile behavior.
- **Celebration Animations:** The "Mutual Match" overlay must occupy the full screen and trigger responsive visual feedback. Avoid heavy external canvas/particle packages. Instead, rely on lightweight CSS-based particle bursts or structural Tailwind keyframe transitions.
- **Label Wrapping on Charts:** Ensure all Chart.js labels are programmatically split if they exceed 16 characters, and always implement a custom tooltip override utilizing the `callbacks.title` configuration.

## 5. Typical Tasks for Jules

When assigned issues with the `jules` label on GitHub, you are authorized to autonomously perform:

- **Feature Additions:** Adding profile-building wizards, ECTS progress indicators, or document lockers inside the Compliance Tracker.
- **Bug Fixing:** Correcting state mismatches where matches fail to trigger after reciprocal swipes, or fixing text truncation on small mobile screens.
- **Refactoring:** Converting semantic HTML simulation containers to robust, reusable React components while maintaining visual aesthetics.

## 6. Verification Steps for VM Runs

When executing tasks in the Cloud VM:

- Ensure all static assets, Tailwind scripts, and Google Chart.js files are resolved using direct CDN references or reliable lockfiles.
- Verify that database initializations do not execute without prior Firebase authentication steps (`signInAnonymously`).
- Compile and verify that your modifications do not break responsive layouts on smaller devices before submitting your final Pull Request.
