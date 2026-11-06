# MakeMistakes

> **Learn by Building. Prove by Shipping.**

MakeMistakes is an AI-powered engineering platform where students build real startup products, learn through mistakes, and graduate with a recruiter-verified **Proof-of-Work portfolio**.

---

## 🚀 Core Philosophy

*"Confused users never convert. Tutorial watchers never ship."*

Traditional learning platforms force engineering students to watch endless video tutorials or build generic CRUD projects (to-do apps, weather dashboards, expense trackers) that recruiters ignore.

**MakeMistakes flips the model:**
- **Zero Tutorial CRUD Apps**: Students build production systems (API Rate Limiters, Idempotent Payment Engines, Distributed Queues).
- **Zero Code Generation by AI**: The AI behaves like a Senior Socratic Engineering Mentor—challenging architecture decisions without writing code.
- **Progressive Revelation**: Complex systems are unlocked step-by-step to prevent technical overwhelm.
- **Verifiable Proof of Work**: Every completed mission produces telemetry reports, SLA performance benchmarks, and recruiter-verifiable portfolios.

---

## ✨ Features & Architecture

### 1. Landing Page (`/`)
- **13 Conversion-Focused Sections**: `Hero`, `SocialProof`, `Problem`, `WhatIsMakeMistakes`, `HowItWorks`, `ProofOfWork`, `DashboardPreview`, `AICoach`, `BuilderJourney`, `Recruiters`, `StudentProjects`, `FAQ`, `CTA`.
- High-contrast dark design system (`bg-zinc-950`), warm amber accents (`#f59e0b`), monospace telemetry cards, and interactive journey simulators.

### 2. Premium Authentication Hub (`/auth`)
- **Split-Screen Desktop Architecture**: Branding & telemetry preview panel on the left; form canvas on the right.
- **Dual Persona Portals**: Dedicated paths for **Student / Builder** (`/auth/student/*`) and **Recruiter** (`/auth/recruiter/*`).
- **Authentication**: Email-based 6-digit OTP verification (`/auth/verify`), link recovery (`/auth/forgot-password`), and password strength feedback. Social sign-in is currently unavailable.

### 3. Apple & Linear 6-Screen Onboarding (`/onboarding`)
- **Screen 1 (Welcome)**: Platform mission & Proof-of-Work execution briefing.
- **Screen 2 (How It Works)**: 6-step vertical timeline.
- **Screen 3 (Explore Engineering Roles)**: 10 interactive startup role cards (Frontend, Backend, AI, Mobile, DevOps, Cloud, Data, ML, Security, Product).
- **Screen 4 (Choose Direction)**: Learning journeys (Frontend, Backend, AI, Help Me Choose).
- **Screen 5 (Mission Zero)**: Select from 6 startup production missions.
- **Screen 6 (Mission Brief)**: Explains the Problem, Learnings, and Rewards before touching any code.

### 4. Progressive Unlocking Builder Workspace (`/workspace`)
- **Step-by-Step Revelation**: Unlocks files progressively (e.g., `Step 1: redis.ts` → `Step 2: limiter.ts` → `Step 3: middleware.ts` → `Step 4: docker-compose.yml`), keeping 18-24 y.o. students focused without information overload.
- **Concurrency Test Runner**: Simulates 10,000 req/s traffic bursts and measures P99 SLA latency under load.
- **Socratic Senior AI Coach**: Live chat console offering architectural guidance and debugging hints without writing the code for the student.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.2.10](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📂 Project Structure

```
c:\makemistakes\
├── public/                 # Static assets & icons
├── specs/                  # Product specification documentation
├── src/
│   ├── app/
│   │   ├── auth/           # Authentication hub, student/recruiter login/signup, verify, forgot-password
│   │   ├── onboarding/     # 6-screen Apple/Linear onboarding flow
│   │   ├── workspace/      # Step-by-step progressive unlocking workspace
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # MakeMistakes landing page
│   ├── components/
│   │   ├── auth/           # AuthInput, BrandingPanel, PasswordStrength, SocialButtons
│   │   ├── onboarding/     # StepWelcome, StepTimeline, StepRolesExplorer, StepMissionsZero, etc.
│   │   └── sections/       # Hero, HowItWorks, ProofOfWork, AICoach, FAQ, CTA, etc.
│   └── globals.css         # Global Tailwind CSS tokens
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18+** installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/makemistakes40-cpu/mmp.git
   cd mmp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔐 Required Security Configuration

Configure these values in the server environment before starting the application:

- `JWT_ACCESS_SECRET`: a private, randomly generated secret with at least 32 bytes. Keep the same value across application instances and restarts.
- `GITHUB_TOKEN_ENCRYPTION_KEY`: base64 encoding of exactly 32 cryptographically random bytes. Required for GitHub account linking and token storage.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: server-side GitHub OAuth application credentials.

Generate secret values with a trusted password manager or a cryptographically secure random generator. Do not commit them, expose them through `NEXT_PUBLIC_*` variables, or include them in logs. Changing `JWT_ACCESS_SECRET` invalidates existing sessions; deploy a replacement value during a planned maintenance window and require users to sign in again. Tokens created with the former hardcoded development key are not accepted. Changing `GITHUB_TOKEN_ENCRYPTION_KEY` makes previously encrypted GitHub tokens unreadable; revoke and reconnect those accounts or perform a controlled re-encryption migration before rotating it.

The GitHub encryption key must remain stable across deployments. Existing plaintext GitHub tokens are encrypted when used by the GitHub push workflow; new connections are encrypted immediately.

Run the isolated security-helper tests with `node --test tests/security/security.test.mjs`.

### MongoDB Atlas DNS configuration

Local development uses the configured `DNS_SERVERS` list when provided, or falls back to
`8.8.8.8`, `1.1.1.1`, and `8.8.4.4` outside production. Production preserves the deployment
platform's DNS settings by default. To explicitly configure resolvers, set `DNS_SERVERS` to a
comma-separated list; `DNS_FALLBACK=true` opts production into the local fallback list.
`DISABLE_CUSTOM_DNS=true` or `DNS_FALLBACK=false` leaves the system resolver untouched.

Use the DNS settings appropriate for the host or VPC; do not override managed production DNS
unless the deployment environment requires it.

### Email and payment configuration

- Production OTP delivery requires a working `SMTP_USER`/`SMTP_PASS` (and optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`) or `RESEND_API_KEY` with `RESEND_FROM`. Ethereal previews are available only in local development.
- Production checkout requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Missing gateway configuration or order creation failures stop checkout; production does not fall back to sandbox.
- Local payment simulation requires both `PAYMENT_SANDBOX_ENABLED=true` and a dedicated `PAYMENT_SANDBOX_SECRET` of at least 32 bytes. Sandbox mode is rejected in production and must never be enabled in a production environment.
- Razorpay webhook configuration must use the exact webhook signing secret configured in the Razorpay dashboard. Never reuse the JWT signing secret.

---

## 🔒 License

MIT License © 2026 MakeMistakes. All rights reserved.
