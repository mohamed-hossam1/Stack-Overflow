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

## 🌐 Live Demo

👉 [https://stack-overflow-dev-theta.vercel.app/](https://stack-overflow-dev-theta.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🧠 Overview

**DevFlow** is a modern, full-stack developer Q&A community platform inspired by Stack Overflow. Ask questions, share answers, upvote helpful content, and explore a rich ecosystem of tags and topics — all within a clean, responsive interface with full dark mode support.

The app features AI-powered answer generation via the Groq API, OAuth authentication with GitHub and Google, a rich Markdown editor, and a real-time voting system.

---

## ✨ Features

- **Authentication** — Sign up/in with email & password, GitHub, or Google OAuth (powered by Auth.js v5)
- **Ask & Answer Questions** — Rich Markdown editor with syntax highlighting, code blocks, tables, and more
- **AI Answer Generation** — Generate AI-powered answers using the Groq LLaMA model
- **Voting System** — Upvote and downvote questions and answers
- **Tags & Discovery** — Tag-based filtering, top tags sidebar, and hot questions widget
- **Community Page** — Browse all registered users
- **Search & Filter** — Local search with debouncing and URL-synced filter controls
- **Dark Mode** — Full light/dark theme toggle with `next-themes`
- **View Tracking** — Automatic question view increments
- **Responsive Design** — Mobile-first layout with a hamburger navigation drawer
- **Pagination** — Paginated listings for questions, answers, tags, and users

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Server Actions) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/), shadcn/ui |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| Auth | [Auth.js v5](https://authjs.dev/) (Credentials, GitHub, Google) |
| Editor | [@mdxeditor/editor](https://mdxeditor.dev/) |
| Markdown | [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote), [Bright](https://github.com/code-hike/bright) |
| AI | [Groq API](https://groq.com/) (LLaMA 3.1) |
| Validation | [Zod](https://zod.dev/) |
| Forms | [React Hook Form](https://react-hook-form.com/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Deployment | [Vercel](https://vercel.com/) |

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

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing patterns and passes linting.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ using Next.js 15 and deployed on Vercel</p>
  <a href="https://stack-overflow-dev-theta.vercel.app/">stack-overflow-dev-theta.vercel.app</a>
</div>
