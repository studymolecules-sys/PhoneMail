# PhoneMail Application Blueprint & Agent Instructions

This document serves as the master blueprint and instruction set for AI agents working on the **PhoneMail** project. It provides all architectural decisions, design paradigms, technology stack details, and phase-by-phase implementation guidelines to prevent hallucinations and maintain project continuity.

---

## 1. Project Overview
**PhoneMail** is a modern, zero-cost, high-performance web application mimicking an email application but utilizing phone numbers as email IDs (e.g., `9876543210@phonemail.com`). 
The application serves two distinct user experiences depending on the device:
- **Mobile Client (PWA)**: Implements a "WhatsApp-style" chat interface where emails are grouped by sender, providing an instant messenger feel (similar to Spike Mail).
- **Desktop Web Client**: Provides a robust, multi-pane experience mimicking **Gmail** (Light Theme, traditional email table list). This is a strict requirement from the Buildathon rubric to distinguish the web client from the mobile client.

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

### A. Mobile Client (Modern Email UX with Optional Chat Feature)
- **Goal**: Feel like a native app. Zero layout shift, fluid swipe gestures, and instant feedback.
- **Navigation**: 
  - Top-left hamburger menu with consistent folders (Inbox, Starred, Sent, Drafts, Spam, Trash) and an optional "Chat Interface" section.
  - Profile icon top-right (Settings, Alias Management).
  - Full-width search bar at the top, with filter chips (All, Unread, Attachments, Favorites) directly below.
- **Home Screen**:
  - Standard chronological email list mimicking Gmail mobile.
  - Floating Action Button (FAB) for composing new emails positioned strategically at the bottom right.
- **Chat Interface (Optional Feature)**:
  - Accessible via the "Chat Interface" sidebar section.
  - Groups emails by sender like a WhatsApp/Spike thread. Inside a chat, the To field is locked.
  - **Gestures**: Swipe right on a message to reply (links to original email). Tap long emails to expand into traditional view.

### B. Desktop Web Client (Gmail UX)
- **Goal**: High information density and productivity matching the Gmail web interface.
- **Layout**: 3-pane layout (Sidebar -> Inbox List -> Reading Pane) styled in a sleek, premium Light Theme (`--gm-app-bg: #f6f8fc`).
- **Features**: Native keyboard shortcuts (e.g., 'c' to compose, 'Esc' to clear selection). No chat-style interface on Desktop.

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

### 5.2 Email Routing System (Cloud Architecture)
- **Receiving (Cloudflare Email Routing)**: Cloudflare intercepts raw emails aimed at `*@pmail.vixiya.com` and passes them to a Cloudflare Email Worker. The worker parses the MIME data and sends a JSON POST payload to our Vercel Next.js `/api/incoming-email` webhook, which inserts into Supabase.
- **Sending (Brevo API)**: Next.js backend leverages the Brevo API to send outward emails to external domains (e.g. `@gmail.com`). Internal emails bypass this and route directly via Supabase.
- **SMS Notification**: Twilio sends a generic notification SMS for offline users.

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
└── docker-compose.yml      # Orchestrates Postgres and Web containers
└── cloudflare-email-worker.js # Email intercept script
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

**Phase 3: The SMTP Layer (Cloud Migration)**
- Retired local Node.js `smtp-server` in favor of **Cloudflare Email Routing**.
- Added `/api/incoming-email` webhook to receive parsed JSON from Cloudflare Worker.
- Integrated **Brevo (Sendinblue) API** into `actions.ts` for sending to external domains.

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

**Phase 7: $50k Buildathon Masterplan & UX Overhaul**
To win the $50k prize and beat AI competitors, we are implementing a 10-step UX Masterplan to make the app feel like a premium native OS application.

**Masterplan Checklist:**
- [x] **1. Frosted Glass UI (Glassmorphism)**: Mobile headers and FAB upgraded with translucent blurring and premium gradients.
- [x] **2. Tactile Haptic Feedback (Web)**: `navigator.vibrate` integrated for critical actions (sending, starring).
- [x] **3. Superhuman-Style Keyboard Shortcuts**: Native shortcuts (`C`, `Esc`) added to Desktop Gmail client.
- [x] **4. Dynamic Island Notifications**: Built custom `Toast.tsx` system replacing generic browser alerts.
- [x] **5. Swipe-to-Action Physics**: Mobile chat list items can be swiped to reveal quick actions.
- [x] **6. Morphing Micro-Animations**: FAB smoothly morphs and scales when pressed.
- [x] **7. Intelligent "Zero Data" Magic States**: Empty inboxes guide the user with subtle animations.
- [x] **8. Staggered Animated Filter Chips**: Mobile chips use native iOS segment control physics.
- [x] **9. Fluid Conversation Transitions**: Chat screens slide in over the inbox seamlessly.
- [x] **10. PWA Offline Polish**: Optimistic UI and loading skeletons for slow networks.

**Additional Phase 7 Adjustments:**
- **Strict Separation of Clients**: Desktop users receive a bespoke `GmailDesktopClient.tsx` (Light theme, table layout) while mobile users receive the `ClientShell.tsx` WhatsApp layout, split purely via CSS media queries.
- **Alias Management**: Restored missing Alias ID and Language settings to `ProfileModal.tsx`, completely functional via `localStorage`.
- **Traditional Compose**: Maintained Spike-style camera icon toggle to open a locked "Traditional Compose" modal inside chats.

**Phase 8: Rich Text Formatting & Native Email rendering**
- Built a zero-dependency `RichTextEditor.tsx` using `contenteditable` to allow bold, italic, underline, list, and link formatting without bloating the app.
- Implemented the Rich Text Editor inside `/compose` and the Traditional Compose modal.
- Added explicit "View Original" toggles to chat bubbles, allowing users to pop out complex HTML emails (from Gmail, newsletters, etc.) into a safe `iframe`/modal view without breaking the native WhatsApp-style chat UI.

**Phase 9: Unified UI & Component Parity**
- Implemented consistent folder navigation (Starred, Sent, Drafts, Spam, Trash) across both Desktop (Sidebar) and Mobile (Drawer) views.
- Overhauled iconography: replaced standard `lucide-react` icons with unique variants (`Mails`, `Bookmark`, `SendHorizontal`, `Pencil`, `ShieldAlert`) wrapped in premium glassmorphic `.iconBox` wrappers with custom `data-color` tints (blue, yellow, green, gray, orange, red).
- Relocated the Compose button from the desktop Sidebar to a floating action button (FAB), mimicking modern email clients.
- Refined Toast notification lifecycle using CSS `@starting-style` equivalent logic (conditional `pointer-events: none` and `opacity`) to ensure smooth exit animations without React unmount flashes.
- Enhanced localization synchronization by dispatching a global `pm_languageChange` event when the language is changed in `ProfileModal.tsx`, instantly updating the Sidebar, Drawer, and Desktop layouts without a page reload or save click.

---
**Agent Rule 1**: Always check this file before generating significant architecture changes or altering the tech stack. Adhere to the zero-cost and Vanilla CSS rules rigidly. No Tailwind.
**Agent Rule 2**: Do NOT revert the desktop client back to a WhatsApp clone. The desktop MUST remain Gmail-style per the AlphaStack rubric.
**Agent Rule 3**: Do NOT implement "fake" buttons. If a button is added, it must have functional state (even if just `localStorage` or UI transitions) to maintain a $50k-quality user experience.
