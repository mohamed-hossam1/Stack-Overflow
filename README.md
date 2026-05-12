# DevFlow — Stack Overflow for Developers

<div align="center">
  <img src="public/images/site-logo.svg" alt="DevFlow Logo" width="80" />

  <h3>A full-stack Q&A platform for developers, built with Next.js 15</h3>

  <p>
    <a href="https://stack-overflow-dev-theta.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-orange?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?style=flat-square&logo=tailwindcss" />
    <img src="https://img.shields.io/badge/Auth.js-v5-blue?style=flat-square" />
  </p>
</div>

---

## Live Demo

👉 [https://stack-overflow-dev-theta.vercel.app/](https://stack-overflow-dev-theta.vercel.app/)

---

## Features


- **React Server Components (RSC)** throughout — minimal client JavaScript bundle, with selective client islands for interactive features
- **Optimistic UI** on the voting system — state updates instantly with server reconciliation and automatic rollback on failure
- **Multi-document MongoDB transactions** using Mongoose sessions across every mutation (question creation, voting, answer posting, deletion) ensuring data consistency
- **Parallel data fetching** with `Promise.all` in server components to eliminate sequential waterfall requests
- **Non-blocking view tracking** via Next.js `after()` API — increments are deferred post-response, never blocking render
- **Full dark mode** implemented at the CSS variable level with `next-themes`, including a custom CodeMirror dark extension for the Markdown editor


---

 
## Architecture
 
### Request Lifecycle
 
```
Browser → Next.js Middleware (Auth.js session check)
       → RSC Page (async, server-fetches data in parallel)
       → Server Action (Zod validation → Mongoose transaction → revalidateTag)
       → Client Component (optimistic update → server sync → rollback on failure)
```
 
### App Router Structure
 
```
app/
├── (auth)/                    # Isolated auth layout group
│   ├── sign-in/               # Credentials + OAuth
│   └── sign-up/               # Full validation with bcrypt
├── (root)/                    # Main app with Navbar/Sidebars
│   ├── page.tsx               # Server-rendered, paginated question feed
│   ├── questions/[id]/        # Dynamic question detail + answers
│   │   └── edit/              # Author-only edit (server-side auth check)
│   ├── profile/[id]/          # User profile with tabbed content
│   │   └── edit/              # Owner-only edit with ProfileForm
│   ├── tags/[id]/             # Tag-filtered question lists
│   ├── community/             # Paginated user directory
│   └── collection/            # Authenticated saved questions
└── api/
    ├── auth/signin-with-oauth # OAuth transaction handler
    ├── users/ + accounts/     # RESTful CRUD with auth guards
    └── ai/answers/            # Groq LLaMA 3.1 integration
```
 
---
## Tech Stack
 
| Category | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, Server Actions, `after()`) |
| UI Library | React 19.1 (RSC, `use()` hook for promise unwrapping) |
| Language | TypeScript 5 (strict mode, ambient type declarations) |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI primitives) |
| Database | MongoDB + Mongoose 9 (transactions, lean queries, indexes) |
| Auth | Auth.js v5 (Credentials, GitHub, Google OAuth) |
| Validation | Zod (server + client, shared schemas) |
| Forms | React Hook Form 7 |
| Editor | MDXEditor (rich Markdown with CodeMirror syntax highlighting) |
| Markdown | next-mdx-remote + Bright (server-side syntax highlighting) |
| AI | Groq API — LLaMA 3.1 8B |
| Caching | Next.js `unstable_cache` with tag-based revalidation |
| Notifications | Sonner (toast system) |
| Deployment | Vercel (Edge Network, automatic preview deployments) |
 
---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- GitHub and Google OAuth app credentials
- Groq API key

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/devflow.git
cd devflow
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables** (see below)

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Auth.js
AUTH_SECRET=your_auth_secret_key

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant   # optional, this is the default

# App URL (required for API calls)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

> **Tip:** For production on Vercel, set `NEXT_PUBLIC_API_BASE_URL` to your deployed domain (e.g., `https://your-app.vercel.app/api`).

---

## 📁 Project Structure

```
devflow/
├── app/
│   ├── (auth)/             # Sign-in and sign-up pages
│   ├── (root)/             # Main app pages (home, questions, tags, community)
│   └── api/                # REST API routes (users, accounts, auth, AI)
├── components/
│   ├── cards/              # QuestionCard, AnswerCard, TagCard, UserCard
│   ├── editor/             # MDX editor and preview
│   ├── filters/            # CommonFilter, HomeFilter
│   ├── forms/              # AuthForm, QuestionForm, AnswerForm
│   ├── navigation/         # Navbar, LeftSidebar, RightSidebar
│   ├── search/             # LocalSearch
│   ├── votes/              # Votes component
│   └── ui/                 # Reusable shadcn/ui primitives
├── constants/              # Routes, filters, sidebar links, states
├── database/               # Mongoose models
├── lib/
│   ├── actions/            # Server Actions (questions, answers, votes, auth, tags)
│   ├── handlers/           # Action and fetch handler utilities
│   ├── api.ts              # Client-side API wrapper
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript type declarations
```



## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ using Next.js 15 and deployed on Vercel</p>
  <a href="https://stack-overflow-dev-theta.vercel.app/">stack-overflow-dev-theta.vercel.app</a>
</div>
