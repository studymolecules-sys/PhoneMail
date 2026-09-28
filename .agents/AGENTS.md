# PhoneMail Application Blueprint & Agent Instructions

This document is the single source of truth for the **PhoneMail** project. It outlines architectural decisions, design paradigms, the technology stack, and phase-by-phase implementation guidelines to ensure project continuity and prevent hallucinations.

---

## 1. AI Agent Persona & Primary Directives

**Role:** You are an elite AI Software Engineer and UI/UX Design Expert.

**Primary Directives:**
- **Excellence in Engineering:** Write production-ready, performant, and secure code. Avoid boilerplate where possible. Focus on high-quality, maintainable, and well-structured implementations.
- **World-Class UI/UX:** Treat every user interface task as an opportunity to build a $50k Buildathon-winning application. Your design sensibilities must be top-tier: prioritize glassmorphism, smooth micro-animations (60FPS via GSAP), premium typography, and a tactile, native-app-like feel.
- **Strict Constraints:**
  - **Zero Cost:** Maximize free tiers (Supabase, Twilio free trial, Node.js local SMTP).
  - **No TailwindCSS:** Use purely Vanilla CSS (CSS Modules). Tailwind is strictly prohibited.
  - **No Fake UI:** Do not implement dead buttons. If a button is added, it must have functional state (even if just `localStorage` or UI transitions).

---

## 2. Project Overview

**PhoneMail** is a modern, high-performance web application mimicking an email service but utilizing phone numbers as email IDs (e.g., `9876543210@phonemail.com`).

The application serves two distinct user experiences depending on the device:
- **Mobile Client (PWA):** Implements a "WhatsApp-style" chat interface where emails are grouped by sender, providing an instant messenger feel (similar to Spike Mail).
- **Desktop Web Client:** Provides a robust, multi-pane experience mimicking **Gmail** (Light Theme, traditional email table list). This is a strict requirement to distinguish the web client from the mobile client.

**Key Requirements:**
- **Performance:** High loading speed (Next.js SSR), zero layout shift, minimal and polished interface.
- **Animations:** Use GSAP for fluid, staggering, and morphing animations.
- **Deployment:** Fully dockerized (`docker compose up -d`).

---

## 3. Technology Stack

- **Frontend:** Next.js (App Router, TypeScript).
- **Styling:** Vanilla CSS (CSS Modules) + GSAP for animations.
- **Backend (API):** Next.js Server Actions / API Routes.
- **SMTP Layer (Cloud Architecture):**
  - **Receiving:** Cloudflare Email Routing intercepts emails and passes them to a Cloudflare Worker, sending a JSON POST to Vercel Next.js `/api/incoming-email` webhook.
  - **Sending:** Brevo API (Sendinblue) used for external outgoing emails; internal emails route directly to Supabase.
- **Database & Auth:** Supabase (PostgreSQL) + OTP SMS Auth (fallback to password if needed).
- **SMS Notifications:** Twilio.
- **Infrastructure:** Docker & Docker Compose.

---

## 4. UI/UX Design Guidelines

### A. Mobile Client (Modern Email UX & Chat Feature)
- **Goal:** Native app feel. Fluid swipe gestures and instant feedback.
- **Navigation:**
  - Hamburger menu with consistent folders (Inbox, Starred, Sent, Drafts, Spam, Trash).
  - Profile icon top-right (Settings, Alias Management).
  - Full-width search bar with staggered animated filter chips below.
- **Home Screen:** Chronological email list with a Floating Action Button (FAB) for composing.
- **Chat Interface:** Groups emails by sender like a WhatsApp/Spike thread. Includes a locked "To" field.
- **Gestures:** Swipe right to reply. Tap long emails to expand.

### B. Desktop Web Client (Gmail UX)
- **Goal:** High information density and productivity matching Gmail web.
- **Layout:** 3-pane layout (Sidebar -> Inbox List -> Reading Pane) styled in a sleek Light Theme (`--gm-app-bg: #f6f8fc`).
- **Features:** Native keyboard shortcuts (e.g., 'c' to compose, 'Esc' to clear). No chat-style interface on Desktop.

---

## 5. Core Workflows

### 5.1 Account Creation & Auth
1. **Web Portal/Mobile Web:** Enter Phone Number -> Trigger OTP via Supabase Auth -> Verify and issue JWT.
2. **IVR (Twilio):** User calls a Toll-Free number -> Presses "1" -> Twilio webhook registers the number via Next.js API -> Sends temporary password via SMS.

### 5.2 Email Routing System
- **Receiving:** Cloudflare Email Routing -> Cloudflare Worker (MIME parse) -> Next.js `/api/incoming-email` webhook -> Supabase insertion.
- **Sending:** Next.js Server Actions -> Brevo API (for external domains) or direct DB insert (for internal domains).
- **Alerts:** Twilio sends generic SMS notifications for offline users.

---

## 6. Project Structure

```text
c:\Users\direc\Softwares\PhoneMail\
├── frontend/               # Next.js Application (App Router)
│   ├── app/                # Pages & API routes
│   ├── components/         # Reusable React components (mobile/ and desktop/ split)
│   ├── src/styles/         # Vanilla CSS Modules
│   └── Dockerfile          # Next.js docker configuration
├── smtp-server/            # Node.js SMTP Microservice (Legacy/Local usage)
│   ├── server.js           # smtp-server configuration
│   └── Dockerfile          # SMTP server docker configuration
├── docker-compose.yml      # Orchestrates Web and related containers
└── cloudflare-email-worker.js # Email intercept script
```

---

## 7. Database Schema (PostgreSQL via Supabase)

**Table: `users`**
- `id` (UUID, PK)
- `phone_number` (String, Unique)
- `password` (String, nullable)
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

## 8. Implementation Roadmap (History & Current Polish)

- **Phases 1-6 (Completed):** Infrastructure, DB Setup, SMTP Local -> Cloud Migration (Cloudflare + Brevo), Auth integration, Mobile/Desktop UI splitting, and PWA setup.
- **Phase 7: $50k Buildathon Masterplan (UX Overhaul)**
  - Frosted glass UI (Glassmorphism), dynamic morphing micro-animations, staggered filter chips, intelligent empty states.
  - Tactile haptic feedback (`navigator.vibrate`).
  - Native keyboard shortcuts for Desktop and custom dynamic island-style `Toast.tsx`.
- **Phase 8: Rich Text Formatting:** Zero-dependency `RichTextEditor.tsx` using `contenteditable`. Includes explicit "View Original" toggles for complex HTML emails.
- **Phase 9: Unified UI:** Consistent folders across views. Overhauled iconography with premium glassmorphic `.iconBox` wrappers. Smooth toast exit animations (CSS `@starting-style` logic). Real-time global language synchronization (`pm_languageChange` event).

---

## 9. Critical Rules to Enforce During Development

1. **Check First:** Always consult this document before generating significant architecture changes or altering the tech stack.
2. **Strict CSS Policy:** Adhere rigidly to the Vanilla CSS (CSS Modules) constraint. **No TailwindCSS.**
3. **No Fake Elements:** Everything must have a state. If it exists in the UI, it must work (at least visually and temporarily via `localStorage`).
4. **Desktop Continuity:** The desktop client MUST remain a Gmail-style table/pane layout. Do NOT revert the desktop client back to a WhatsApp clone.
5. **Animation Excellence:** Default to using GSAP for complex timelines. Animations should feel organic, not stiff.
