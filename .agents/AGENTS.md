# PhoneMail Application Blueprint & Agent Instructions

This document serves as the master blueprint and instruction set for AI agents working on the **PhoneMail** project. It provides all architectural decisions, design paradigms, technology stack details, and phase-by-phase implementation guidelines to prevent hallucinations and maintain project continuity.

---

## 1. Project Overview
**PhoneMail** is a modern, zero-cost, high-performance web application mimicking an email application but utilizing phone numbers as email IDs (e.g., `9876543210@phonemail.com`). 
The application serves two distinct user experiences depending on the device:
- **Mobile Client (PWA)**: Implements a "WhatsApp-style" chat interface where emails are grouped by sender, providing an instant messenger feel (similar to Spike Mail).
- **Desktop Web Client**: Provides a robust, multi-pane experience completely unified under the same WhatsApp-style Dark theme.

**Key Requirements & Constraints:**
- **Zero Cost**: Maximize free tiers (Supabase, Twilio free trial, Node.js local SMTP).
- **Performance**: High loading speed (Next.js SSR), zero stutter, minimal and polished interface.
- **Styling**: Vanilla CSS / CSS Modules only (NO TailwindCSS unless explicitly permitted).
- **Animations**: Use GSAP for fluid 60FPS animations.
- **Deployment**: Must be fully dockerized (`docker compose up -d`).

---

## 2. Technology Stack

- **Frontend**: Next.js (App Router, TypeScript).
- **Styling**: Vanilla CSS (CSS Modules) + GSAP.
- **Backend (API)**: Next.js Server Actions / API Routes.
- **SMTP Microservice**: Node.js (`smtp-server`, `mailparser`, `pg`). Runs locally to catch all incoming emails to `@phonemail.com`.
- **Database & Auth**: PostgreSQL via Supabase (or local Postgres via Docker Compose). OTP SMS auth via Supabase or fallback to Password.
- **SMS Notifications**: Twilio (for sending alerts about received emails and IVR registration).
- **Infrastructure**: Docker & Docker Compose.

---

## 3. UI/UX Design Guidelines

### A. Mobile Client (WhatsApp Design Language + Spike Mail UX)
- **Goal**: Feel like a native app. Zero layout shift, fluid swipe gestures, and instant feedback.
- **Navigation**: 
  - Top-left hamburger menu (Home, Drafts, Spam, Trash).
  - Profile icon top-right (Settings, Alias Management).
  - Full-width search bar at the top, with filter chips (All, Unread, Attachments, Favorites) directly below.
- **Home Screen**:
  - Unified inbox (no separate Sent folder). Conversations are grouped by Phone Number.
  - Floating Action Button (FAB) for composing new emails.
- **Conversation View (Spike-like)**:
  - Inside a chat, the To field is locked.
  - A compact Subject field rests above the message input box. Hidden on replies, visible on new threads.
  - **Gestures**: Swipe right on a message to reply (links to original email). Tap long emails to expand into traditional view.

### B. Desktop Web Client (Unified WhatsApp Web UX)
- **Goal**: High information density and productivity with a cohesive, seamless extension of the mobile app. No mixed light/dark modes.
- **Layout**: Multi-pane layout styled strictly in Dark Slate and Emerald Green to match the mobile WhatsApp design language.

---

## 4. Database Schema (PostgreSQL)

**Table: `users`**
- `id` (UUID, PK)
- `phone_number` (String, Unique)
- `password` (String, nullable if using OTP)
- `created_at` (Timestamp)

**Table: `emails`**
- `id` (UUID, PK)
- `sender_address` (String)
- `recipient_address` (String)
- `subject` (Text)
- `body_html` (Text)
- `body_text` (Text)
- `read_status` (Boolean, Default: False)
- `created_at` (Timestamp)

---

## 5. Core Workflows

### 5.1 Account Creation & Auth
1. **Web Portal/Mobile Web**: Enter Phone Number -> Trigger OTP via Supabase Auth (or fallback to Password only if explicitly needed). Verify and issue JWT.
2. **IVR (Twilio)**: User calls a Toll-Free number -> Presses "1" -> Twilio webhook registers the number via Next.js API -> Sends temporary password via SMS.

### 5.2 Email Routing System
- **Receiving**: The Node.js `smtp-server` runs on Port 25. It intercepts emails aimed at `@phonemail.com`, parses the MIME data, extracts the phone number, and inserts the record into the PostgreSQL `emails` table.
- **SMS Notification**: If the user doesn't have the Mobile App logged in, trigger Twilio to send a generic notification SMS: `"You have received an email from <Sender>. Subject: <Subject>."`

---

## 6. Project Structure

```
c:\Users\direc\Softwares\PhoneMail\
├── frontend/               # Next.js Application (App Router)
│   ├── app/                # Pages & API routes
│   ├── components/         # Reusable React components (mobile/ and desktop/ split)
│   ├── src/styles/         # Vanilla CSS Modules
│   └── Dockerfile          # Next.js docker configuration
├── smtp-server/            # Node.js SMTP Microservice
│   ├── server.js           # smtp-server configuration & DB insertion
│   ├── package.json
│   └── Dockerfile          # SMTP server docker configuration
└── docker-compose.yml      # Orchestrates Postgres, SMTP, and Web containers
```

---

## 7. Implementation Roadmap & Agent Instructions

**Phase 1: Setup & Infrastructure (Completed)**
- Next.js initialized without Tailwind.
- Node.js SMTP service initialized.
- `docker-compose.yml` orchestrates the Frontend and SMTP containers natively (Local Postgres was removed in favor of Supabase Cloud).

**Phase 2: Authentication & Twilio Integration (Completed)**
- Implemented Supabase Auth (OTP) within Next.js.
- Set up `/api/twilio/notify` API route to act as webhook for Twilio SMS notifications.
- Fixed Next.js IPv6 Undici fetch bug by injecting `NODE_OPTIONS` via `cross-env`.

**Phase 3: The SMTP Layer (Completed)**
- `smtp-server` successfully writes incoming emails to the Supabase Cloud DB.
- Sends a JSON POST payload to the Next.js Twilio webhook on incoming mail.

**Phase 4: Frontend - Mobile UI (Completed)**
- Prioritized mobile client.
- Styled using CSS Modules exclusively, with premium aesthetic overrides.
- Implemented Spike Mail style chat interface logic (grouped by sender).

**Phase 5: Frontend - Desktop UI (Completed)**
- Built a responsive 3-pane Layout (Sidebar -> Inbox List -> Chat Thread).
- Implemented Next.js Route Groups for conditional layout rendering.

**Phase 6: Polish, Security & PWA (Completed)**
- Added PWA `manifest.json` and meta viewport tags.
- Auth.users `auth.jwt()` extraction used in Supabase RLS policies for strict row-level security.
- All temporary artifacts removed.

**Phase 7: Buildathon Tech-Giant Polish & Submission Overhaul (Completed)**
- **Mobile Client**: Transformed into authentic WhatsApp design language (`#111b21`, `#00a884`, speech bubbles with tails, read checkmarks `✓✓`, doodle background).
- **Onboarding Flow**: Implemented 4-screen WhatsApp onboarding wizard (Language -> Terms -> SIM Auto-Detect Phone -> SMS Auto-Detect OTP) with graceful Supabase bridge fallback.
- **Spike Mail Features**: Implemented swipe-to-tag reply, compact subject toggling, tap-to-expand traditional view modal, and traditional email compose toggle.
- **Drawer & Profile**: Added slide-out navigation drawer (Unified Inbox, Starred, Drafts, Spam, Trash) and Profile modal with active **Alias Management** (`work@phonemail.com`).
- **Desktop Web Client**: Unified with the WhatsApp design language (Dark Slate & Emerald Green) to eliminate the mixed light/dark mode clash. Implemented sleek webkit scrollbars, tactile button scaling, and removed all default browser focus outlines.
- **UX Writing**: Strictly "Show, don't tell." Removed all technical jargon (Supabase, SMTP, RLS) from user-facing components, replacing empty states with minimalist UI and consumer-friendly terms (End-to-end encrypted).
- **PWA & APK Deliverables**: Generated high-res 192x192 & 512x512 maskable app icons, registered service worker (`sw.js`), and documented 1-command APK packaging via PWABuilder / Bubblewrap.
- **Judging & Demo Pipeline**: Created `demo_test.py` for automated end-to-end testing of SMTP port 25 email ingestion, Supabase DB synchronization, and Twilio SMS notification.

---
**Agent Rule 1**: Always check this file before generating significant architecture changes or altering the tech stack. Adhere to the zero-cost and Vanilla CSS rules rigidly.
**Agent Rule 2**: Whenever you make a significant architecture change, update the authentication flow (e.g., from password to OTP), or alter the roadmap, you MUST actively update this `AGENTS.md` file to reflect the changes. This guarantees future agents have the exact, up-to-date context and avoids contradictions.
