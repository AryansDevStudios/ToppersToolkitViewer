# 👁️ Topper's Toolkit Viewer

> High-performance student curriculum portal, PDF.js document viewer, interactive MCQ/reasoning practice platform, and telemetry-backed admin center.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PDF.js](https://img.shields.io/badge/PDF.js-4.4.168-red?style=flat&logo=adobeacrobatreader)](https://mozilla.github.io/pdf.js/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.2-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat&logo=netlify)](https://www.netlify.com/)
[![Status](https://img.shields.io/badge/Status-Active_Production-success)](#)

---

## Description

Topper's Toolkit Viewer is a comprehensive educational portal and curriculum document viewer designed for CBSE students. Powered by a customized, direct integration of Mozilla's PDF.js document engine (`pdfjs-dist`), the application provides a distraction-free digital reading environment for Class 9 notes, textbooks, and study guides.

Beyond document viewing, the platform delivers an all-in-one learning hub featuring pre-seeded CBSE curriculum structures, interactive MCQ test simulators, logical reasoning modules, curated YouTube classrooms taught by leading Indian educators, flashcard systems, and community doubt-resolution boards. The application features a built-in freemium access model governed by a real-time daily preview countdown timer and is supported by a 15+ module administrative command center featuring hardware-level device telemetry and multi-account suspect tracking.

---

## Key Features

- **Integrated PDF.js Document Engine**: Custom client-side PDF viewer (`public/PDFviewer/web/viewer.html` and `PdfViewerWrapper.tsx`) supporting fullscreen mode, dynamic multi-origin document fetching (GitHub raw, jsDelivr CDN, Netlify proxy, Render proxy), and read activity logging.
- **Pre-Seeded CBSE Class 9 Curriculum**: Structured syllabus database (`src/subjects-seed.json`) covering:
  - **Science**: Physics (Motion, Force & Laws of Motion), Chemistry (Matter in Our Surroundings, Is Matter Pure), Biology (Fundamental Unit of Life, Tissues) with embedded chapter MCQs.
  - **Social Science**: History, Geography, Economics, and Democratic Politics across 8 core chapters.
  - **Mathematics**: Core Class 9 mathematical concepts and exercises.
  - **English**: Beehive, Moments, and Grammar modules.
- **Interactive MCQ Examination Engine**: Practice module (`MCQPlayer.tsx`, `SubjectSelector.tsx`, `/mcqs`, `/quiz-results/[attemptId]`) with question shuffling, immediate explanation feedback, scoring summaries, and attempt archiving.
- **Reasoning & Aptitude Simulator**: Dedicated logical assessment environment (`/reasoning`, `ReasoningPlayer.tsx`, `/reasoning-results/[attemptId]`) fostering cognitive development.
- **Curated Video Classrooms**: Organized YouTube learning portal (`/youtube-learning`) categorized by topic and educator:
  - **Science**: Prashant Kirad
  - **Social Science (SST)**: Digraj Singh Rajput
  - **Mathematics**: Shobhit Nirwan
  - **Languages**: English and Hindi masterclasses
- **Flashcard AI & Visual Mind Maps**: Interactive mind map concept visualizer (`/mindmap`) and active recall flashcards (`/flashcard-ai`) for accelerated exam revision.
- **Freemium Access Enforcer & Daily Preview**: Sticky countdown banner (`DailyPreviewTimer.tsx`) displaying remaining free reading minutes before locking content via `PremiumContentWrapper.tsx`.
- **Doubt Box & Student Support**: Student doubt submission box (`/doubt-box`), peer doubt-solving room (`/solve-doubts`), and formal grievance reporting (`/complaints`).
- **On-Demand Print Service**: Direct physical note ordering portal (`/order-print/[noteId]`) with status tracking (`pending`, `completed`, `cancelled`).
- **15+ Module Administrative Command Center**:
  - **Telemetry & Suspect Detection**: Comprehensive device fingerprinting (`LoginLog` recording IP, user agent, OS, browser, resolution, input type, RAM, CPU cores, GPU specs) with automated multi-device suspect alerts (`/admin/suspects`).
  - **User & Access Delegation**: Full user directory with per-subject access grants and revocation (`/admin/users`, `/admin/users/access/[id]`).
  - **Subscription Lifecycle**: Manage subscriber periods, extend subscriptions manually, and review billing (`/admin/subscriptions`, `/admin/active-subscriptions`).
  - **Analytics & Operations**: Track MCQ attempts, review doubt queues, broadcast campus notices, inspect live activity logs, and configure curriculum categories.

---

## Tech Stack

### Frontend & Viewer Engine
- **Framework**: [Next.js 15.3.3](https://nextjs.org/) (App Router, Turbopack)
- **Document Engine**: [PDF.js 4.4.168](https://mozilla.github.io/pdf.js/) (`pdfjs-dist` + standalone web viewer)
- **Library**: [React 18.3.1](https://react.dev/) & [React DOM](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4.1](https://tailwindcss.com/) & `tailwindcss-animate`
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Accordion, Dialog, Tabs, Collapsible, Dropdown Menu, Slider, Switch, Toast, Select)
- **Icons & Carousel**: [Lucide React 0.475.0](https://lucide.dev/), [Embla Carousel](https://www.embla-carousel.com/)

### Backend & Cloud Infrastructure
- **Client Database & Auth**: [Firebase 10.12.2](https://firebase.google.com/) (Firestore, Auth)
- **Admin Backend SDK**: [Firebase Admin 12.1.0](https://firebase.google.com/docs/admin/setup)
- **Deployment Targets**: 
  - [Netlify](https://www.netlify.com/) (`netlify.toml` with Serverless Functions)
  - [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) (`apphosting.yaml`)

### Validation & Utilities
- **Forms & Validation**: [React Hook Form 7.54.2](https://react-hook-form.com/), [Zod 3.23.8](https://zod.dev/)
- **Utilities**: `date-fns 3.6.0`, `date-fns-tz 3.1.3`, `lodash 4.17.21`, `debounce 2.1.0`, `uuid 9.0.1`

---

## Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ recommended)
- **Package Manager**: `npm`
- **Firebase Project**: A Firebase project with Firestore Database, Authentication, and an Admin SDK service account key.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AryansDevStudios/ToppersToolkitViewer.git
   cd ToppersToolkitViewer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.local` using the template:
   ```bash
   cp .env.local.example .env.local
   ```

   Populate your Firebase client credentials and Firebase Admin Service Account Key:
   ```env
   # Firebase Admin SDK Service Account (JSON string)
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'

   # Public Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-firebase-measurement-id"
   ```

### Running the Application

- **Start Development Server** (Runs on port 9002 with Turbopack):
  ```bash
  npm run dev
  ```
  Open `http://localhost:9002` in your browser.

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm run start
  ```

- **Run Linting & Type Checking**:
  ```bash
  npm run lint
  npm run typecheck
  ```

---

## Usage

### Document Viewer
- Access any curriculum chapter through `/browse/[...slug]`.
- The document loads inside `PdfViewerWrapper`, taking advantage of pre-configured caching rules and responsive toolbar tools (page zoom, page jumping, full-screen mode).
- Unauthenticated or non-premium users are subject to the `DailyPreviewTimer`, which counts down free reading time across documents before displaying the subscription modal.

### Interactive Assessments
- Visit `/mcqs` to pick a subject and take chapter-wise mock tests.
- Navigate to `/reasoning` for logical ability challenges.
- Upon completion, detailed performance reports and correct answer reviews are generated at `/quiz-results/[attemptId]`.

### Administrative Supervision
- Staff members can log in to `/admin` to view user profiles, manage curriculum chapters, inspect suspicious simultaneous logins under `/admin/suspects`, and review incoming student print orders.

---

## Project Structure

```
ToppersToolkitViewer/
├── .env.local.example        # Environment variable template
├── apphosting.yaml           # Firebase App Hosting compute specs
├── netlify.toml              # Netlify build and function configuration
├── next.config.ts            # Next.js image domains & caching policies
├── package.json              # Project scripts and dependency manifests
├── subjects-seed.json        # Base seed mapping
├── tailwind.config.ts        # Tailwind CSS design system configuration
├── tsconfig.json             # TypeScript compiler settings
├── docs/
│   └── blueprint.md          # Architectural and functional specifications
├── public/
│   ├── manifest.json         # Web app manifest
│   └── PDFviewer/            # Mozilla PDF.js customized viewer engine
│       ├── build/            # Core PDF.js worker and library scripts
│       └── web/              # Viewer UI, viewer.html, cmaps, and locales
└── src/
    ├── subjects-seed.json    # Complete Class 9 curriculum & embedded MCQs
    ├── app/                  # Next.js App Router (65+ application pages)
    │   ├── (auth)/           # Login and registration authentication routes
    │   ├── admin/            # 15+ sub-routes for platform administration
    │   │   ├── activity/     # Live study activity audit logs
    │   │   ├── mcqs/         # MCQ question editor and question bank
    │   │   ├── suspects/     # Telemetry-based account sharing detection
    │   │   ├── subscriptions/# Active subscriber and access management
    │   │   └── users/        # User directory and access delegation
    │   ├── browse/           # Subject & chapter curriculum explorer
    │   ├── flashcard-ai/     # Flashcard study revision workspace
    │   ├── mcqs/             # Interactive MCQ test taking room
    │   ├── mindmap/          # Visual concept mind mapping canvas
    │   ├── order-print/      # Custom document physical printing service
    │   ├── reasoning/        # Cognitive & logical reasoning assessments
    │   └── youtube-learning/ # Curated video classrooms by topic & teacher
    ├── components/
    │   ├── admin/            # Administrative UI dialogs, forms, and tables
    │   ├── common/           # Document viewer, preview timer, and headers
    │   │   ├── DailyPreviewTimer.tsx
    │   │   ├── NoteViewer.tsx
    │   │   └── PdfViewerWrapper.tsx
    │   ├── mcqs/             # MCQ player and subject selector components
    │   └── ui/               # Radix UI and Tailwind CSS design components
    ├── hooks/
    │   ├── use-auth.ts       # Authentication state hook
    │   └── use-toast.ts      # UI notification hook
    └── lib/
        ├── auth-server.ts    # Firebase Admin server-side verification
        ├── data.ts           # Firestore queries, seed loaders, view loggers
        ├── firebase.ts       # Client Firebase SDK initialization
        ├── firebase-admin.ts # Firebase Admin SDK initialization
        └── types.ts          # Telemetry, Note, Order, and User models
```

---

## Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## License

This repository is maintained by [Aryan Gupta](https://github.com/AryansDevStudios). All rights reserved. Educational materials, assessments, and curriculum data are curated for student study use.
