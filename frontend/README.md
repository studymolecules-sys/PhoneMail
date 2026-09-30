# PhoneMail Frontend

This directory contains the PhoneMail Next.js 16 App Router application. The mobile interface is inbox-first; the conversation view is an optional way to read and reply to a thread.

The root [`README.md`](../README.md) is the canonical guide for product scope, architecture, environment variables, Supabase setup, integrations, and buildathon submission requirements. Check its integration-status section before presenting any provider path as live.

## Run locally

Requirements: Node.js 20 or newer, npm, and the Supabase public project URL and anon key.

Create `frontend/.env.local` with the values supplied for your environment. Keep real secrets out of Git. Then run:

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Supabase phone OTP requires the project Auth settings and SMS provider to be configured; use the configured test phone mapping when testing without real SMS delivery.

For a production-like local run, build first and then start the optimized server:

```powershell
npm run build
npm run start
```

To run the frontend and SMTP demo service with Docker Compose, follow the root README from the repository root. The SMTP service is not hardened for public deployment.
