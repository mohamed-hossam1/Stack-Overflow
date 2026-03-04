## Project Overview

**DevFlow** is a full-stack Q&A platform for developers, inspired by Stack Overflow. Built with Next.js 15 (App Router), it allows users to ask questions, post answers, vote on content, and discover topics through tags. The platform features AI-powered answer generation via the Groq API, OAuth authentication (GitHub/Google), rich Markdown editing, real-time voting, and full dark mode support.

**Live Demo:** https://stack-overflow-dev-theta.vercel.app/

---

## Tech Stack

### Core Framework & Language
- **Next.js 15.5.12** - React framework with App Router (RSC architecture)
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS v4** - Utility-first CSS with custom design tokens
- **shadcn/ui** - Radix UI-based component library
- **next-themes** - Dark/light mode support

### Database & ORM
- **MongoDB** - NoSQL database
- **Mongoose 9.2.2** - ODM for MongoDB with schema validation

### Authentication
- **Auth.js v5** (NextAuth) - Authentication with multiple providers:
  - Credentials (email/password)
  - GitHub OAuth
  - Google OAuth
- **bcryptjs** - Password hashing

### Forms & Validation
- **React Hook Form 7.71.2** - Form state management
- **Zod 3.24.0** - Schema validation

### Content Editing
- **@mdxeditor/editor 3.52.4** - Rich Markdown editor
- **next-mdx-remote 6.0.0** - MDX rendering
- **Bright 1.0.0** - Syntax highlighting for code blocks

### AI Integration
- **Groq API** - LLaMA 3.1 model for AI-powered answer generation

### UI/UX
- **Sonner 2.0.7** - Toast notifications
- **Lucide React** - Icon library
- **query-string** - URL query manipulation

---

## Architecture

### App Router Structure (Next.js 15)

The project uses Next.js App Router with a clear separation between authenticated and public routes:

```
app/
├── (auth)/                    # Auth layout group (sign-in, sign-up)
│   ├── layout.tsx            # Auth-specific layout with branding
│   ├── sign-in/page.tsx      # Sign-in page
│   └── sign-up/page.tsx      # Sign-up page
├── (root)/                    # Main app layout group
│   ├── layout.tsx            # Main layout with Navbar, Sidebars
│   ├── page.tsx              # Home (questions list)
│   ├── ask-question/page.tsx # Create question form
│   ├── community/page.tsx    # Users list
│   ├── tags/
│   │   ├── page.tsx         # Tags list
│   │   └── [id]/page.tsx    # Tag detail with questions
│   └── questions/
│       └── [id]/
│           ├── page.tsx      # Question detail
│           └── edit/page.tsx # Edit question
└── api/                       # REST API routes
    ├── accounts/             # Account CRUD
    ├── users/                # User CRUD
    ├── auth/                 # Auth handlers
    └── ai/answers/           # AI answer generation
```

### Component Organization

```
components/
├── answers/              # Answer-related components
├── cards/                # QuestionCard, AnswerCard, TagCard, UserCard
├── editor/               # MDX editor and preview
├── filters/              # CommonFilter, HomeFilter
├── forms/                # AuthForm, QuestionForm, AnswerForm, SocialAuthForm
├── navigation/           # Navbar, LeftSidebar, RightSidebar, MobileNavigation
├── search/               # LocalSearch component
├── votes/                # Votes component
├── ui/                   # shadcn/ui primitives (button, input, etc.)
├── DataRenderer.tsx      # Generic data/error/empty state renderer
├── Metric.tsx            # Reusable metric display
└── UserAvatar.tsx        # User avatar with fallback
```

---

## Routing System

### Public Routes
- `/` - Home (questions list)
- `/community` - All users
- `/tags` - All tags
- `/tags/[id]` - Tag detail with filtered questions
- `/questions/[id]` - Question detail with answers

### Protected Routes (require authentication)
- `/ask-question` - Create new question
- `/questions/[id]/edit` - Edit question (only author)

**Auth Check Pattern:**
```typescript
// In protected pages
const session = await auth();
if (!session) return redirect("/sign-in");
```

### API Routes
- `POST /api/auth/signin-with-oauth` - OAuth sign-in handler
- `GET/POST/PUT/DELETE /api/users` - User CRUD
- `GET/POST/PUT/DELETE /api/accounts` - Account CRUD
- `POST /api/ai/answers` - AI answer generation

---

## Data Flow

### Server-Side Data Flow (React Server Components)

1. **Page Component** (Server Component) → Calls **Server Action**
2. **Server Action** (`lib/actions/*.action.ts`) → Validates with Zod, connects to DB
3. **Database Models** (`database/*.model.ts`) → Mongoose queries
4. **Return JSON-serialized data** → Back to page component
5. **Component renders** with data

**Example: Question List Flow**
```typescript
// app/(root)/page.tsx
const { success, data, error } = await getQuestions({
  page: Number(page) || 1,
  pageSize: Number(pageSize) || 10,
  query: query || "",
  filter: filter || "",
});

// lib/actions/question.action.ts
export async function getQuestions(params: PaginatedSearchParams) {
  // Validate params
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });
  
  // Query MongoDB
  const questions = await Question.find(filterQuery)
    .populate("tags", "name")
    .populate("author", "name image")
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);
  
  return { success: true, data: { questions, isNext } };
}
```

### Client-Side Data Flow (Interactive Components)

1. **Client Component** → User interaction (form submit, vote click)
2. **Server Action call** → Via `useTransition` or async function
3. **Revalidation** → `revalidatePath()` updates cache
4. **UI updates** → React re-renders with fresh data

**Example: Voting Flow**
```typescript
// components/votes/Votes.tsx
"use client";

const handleVote = async (voteType: "upvote" | "downvote") => {
  setIsLoading(true);
  
  const result = await createVote({ targetId, targetType, voteType });
  
  if (!result.success) {
    toast("Failed to vote", { description: result.error?.message });
  }
  
  setIsLoading(false);
};

// lib/actions/vote.action.ts
export async function createVote(params: CreateVoteParams) {
  // ... validate, check existing vote, update counts
  revalidatePath(ROUTES.QUESTION(targetId)); // Refresh page data
  return { success: true };
}
```

---

## Authentication System

### Architecture

**Auth Configuration:** `auth.ts` (NextAuth v5 config)

**Providers:**
1. **Credentials** - Email/password with bcrypt hashing
2. **GitHub OAuth**
3. **Google OAuth**

### Authentication Flow

#### Sign Up (Credentials)
1. User submits form → `components/forms/AuthForm.tsx`
2. Validates with `SignUpSchema` (Zod)
3. Calls `signUpWithCredentials` server action
4. **Transaction workflow:**
   - Check if user/username exists
   - Hash password with bcrypt (12 rounds)
   - Create User document
   - Create Account document (provider: "credentials")
   - Commit transaction
5. Auto sign-in with `signIn("credentials", { email, password })`

#### Sign In (Credentials)
1. Validates credentials with `SignInSchema`
2. Finds user by email
3. Finds account with provider "credentials"
4. Compares password with bcrypt
5. Signs in via NextAuth

#### OAuth Sign In (GitHub/Google)
1. User clicks OAuth button → triggers `signIn("github")` or `signIn("google")`
2. Redirects to provider
3. Provider callback → `auth.ts` signIn callback
4. Calls `/api/auth/signin-with-oauth` endpoint
5. **Transaction workflow:**
   - Find or create User (by email)
   - Update name/image if changed
   - Find or create Account (linked to OAuth provider)
   - Commit transaction

### Session Management

**Session Structure:**
```typescript
{
  user: {
    id: string;      // MongoDB User._id
    name: string;
    email: string;
    image: string;
  }
}
```

**Getting session in Server Components:**
```typescript
import { auth } from "@/auth";
const session = await auth();
const userId = session?.user?.id;
```

**JWT Callback:**
```typescript
// auth.ts
async jwt({ token, account }) {
  if (account) {
    const existingAccount = await api.accounts.getByProvider(
      account.type === "credentials" ? token.email! : account.providerAccountId
    );
    if (existingAccount) token.sub = existingAccount.userId.toString();
  }
  return token;
}
```

---

## Database Models & Relationships

### Schema Definitions (Mongoose)

#### User Model (`database/user.model.ts`)
```typescript
{
  name: String (required)
  username: String (required, unique)
  email: String (required, unique)
  bio?: String
  image?: String
  location?: String
  portfolio?: String
  reputation: Number (default: 0)
  timestamps: true
}
```

#### Account Model (`database/account.model.ts`)
```typescript
{
  userId: ObjectId → User (required)
  name: String (required)
  image?: String
  password?: String (hashed, credentials only)
  provider: String (required) // "credentials", "github", "google"
  providerAccountId: String (required) // email for credentials, OAuth ID for providers
  timestamps: true
}
```

#### Question Model (`database/question.model.ts`)
```typescript
{
  title: String (required)
  content: String (required) // Markdown
  tags: [ObjectId] → Tag
  views: Number (default: 0)
  upvotes: Number (default: 0)
  downvotes: Number (default: 0)
  answers: Number (default: 0)
  author: ObjectId → User (required)
  timestamps: true
}
```

#### Answer Model (`database/answer.model.ts`)
```typescript
{
  author: ObjectId → User (required)
  question: ObjectId → Question (required)
  content: String (required) // Markdown
  upvotes: Number (default: 0)
  downvotes: Number (default: 0)
  timestamps: true
}
```

#### Tag Model (`database/tag.model.ts`)
```typescript
{
  name: String (required, unique)
  questions: Number (default: 0) // Denormalized count
  timestamps: true
}
```

#### TagQuestion Model (`database/tag-question.model.ts`)
```typescript
{
  tag: ObjectId → Tag (required)
  question: ObjectId → Question (required)
  timestamps: true
}
// Junction table for many-to-many relationship
```

#### Vote Model (`database/vote.model.ts`)
```typescript
{
  author: ObjectId → User (required)
  actionId: ObjectId (required) // Question or Answer ID
  actionType: "question" | "answer" (required)
  voteType: "upvote" | "downvote" (required)
  timestamps: true
}
```

#### Collection Model (`database/collection.model.ts`)
```typescript
{
  author: ObjectId → User (required)
  question: ObjectId → Question (required)
  timestamps: true
}
// Bookmark/save functionality (unused in current UI)
```

#### Interaction Model (`database/interaction.model.ts`)
```typescript
{
  user: ObjectId → User (required)
  action: "view" | "upvote" | "downvote" | "bookmark" | "post" | "edit" | "delete" | "search"
  actionId: ObjectId (required)
  actionType: "question" | "answer"
  timestamps: true
}
// Analytics/tracking (not actively used)
```

### Relationships Diagram

```
User (1) ──< (M) Account
  │
  ├──< (M) Question
  │     │
  │     ├──< (M) Answer
  │     ├──< (M) Vote
  │     └──< (M) TagQuestion ──> (1) Tag
  │
  ├──< (M) Answer
  ├──< (M) Vote
  └──< (M) Collection
```

### Key Denormalization
- `Question.answers` - Count of answers (incremented on answer creation)
- `Question.upvotes/downvotes` - Vote counts (updated on vote)
- `Tag.questions` - Count of questions with this tag
- Author/tag data populated on query, not embedded

---

## Server Actions (lib/actions/)

### Action Handler Pattern

All server actions follow this pattern via `lib/handlers/action.ts`:

```typescript
async function action<T>({ params, schema, authorize = false }: ActionOptions<T>) {
  // 1. Validate params with Zod schema
  if (schema) {
    params = schema.parse(params); // Throws ValidationError if invalid
  }
  
  // 2. Check authentication if required
  if (authorize) {
    session = await auth();
    if (!session) return new UnauthorizedError();
  }
  
  // 3. Connect to database
  await dbConnect();
  
  return { params, session };
}
```

### Question Actions (`lib/actions/question.action.ts`)

**createQuestion**
- Schema: `AskQuestionSchema`
- Auth: Required
- Transaction flow:
  1. Create Question document
  2. For each tag: find or create Tag, increment count
  3. Create TagQuestion junction documents
  4. Update Question with tag IDs

**editQuestion**
- Schema: `EditQuestionSchema`
- Auth: Required (must be author)
- Transaction flow:
  1. Update title/content if changed
  2. Calculate tags to add/remove
  3. Update Tag counts, TagQuestion junctions
  4. Save updated Question

**getQuestions**
- Schema: `PaginatedSearchParamsSchema`
- Filters: newest, unanswered, popular
- Query: title/content regex search
- Returns: paginated questions with populated tags/author

**getQuestion**
- Schema: `GetQuestionSchema`
- Returns: single question with populated tags/author

**incrementViews**
- Schema: `IncrementViewsSchema`
- Increments question.views by 1
- Called via `after()` (Next.js) on question page load

**getHotQuestions**
- Returns: top 5 questions by views + upvotes
- Used in RightSidebar

### Answer Actions (`lib/actions/answer.action.ts`)

**createAnswer**
- Schema: `AnswerServerSchema`
- Auth: Required
- Transaction flow:
  1. Create Answer document
  2. Increment Question.answers count
  3. Revalidate question page

**getAnswers**
- Schema: `GetAnswersSchema`
- Filters: latest, oldest, popular
- Returns: paginated answers with populated author

### Vote Actions (`lib/actions/vote.action.ts`)

**createVote**
- Schema: `CreateVoteSchema`
- Auth: Required
- Transaction flow:
  1. Check for existing vote
  2. If exists and same type → delete vote, decrement count
  3. If exists and different type → update vote, swap counts
  4. If new → create vote, increment count
  5. Revalidate question page

**hasVoted**
- Schema: `HasVotedSchema`
- Auth: Required
- Returns: `{ hasUpvoted: boolean, hasDownvoted: boolean }`

**updateVoteCount** (helper)
- Updates Question or Answer upvote/downvote count
- Used within vote transaction

### User Actions (`lib/actions/user.action.ts`)

**getUsers**
- Schema: `PaginatedSearchParamsSchema`
- Filters: newest, oldest, popular (by reputation)
- Query: name/email regex search
- Returns: paginated users

### Tag Actions (`lib/actions/tag.action.ts`, `tag.actions.ts`)

**getTags**
- Schema: `PaginatedSearchParamsSchema`
- Filters: popular, recent, oldest, name (A-Z)
- Query: name regex search
- Returns: paginated tags

**getTagQuestions**
- Schema: `GetTagQuestionsSchema`
- Returns: tag details + paginated questions with that tag

**getTopTags**
- Returns: top 5 tags by question count
- Used in RightSidebar

### Auth Actions (`lib/actions/auth.action.ts`)

**signUpWithCredentials**
- Schema: `SignUpSchema`
- Transaction flow:
  1. Check user/username doesn't exist
  2. Hash password (bcrypt, 12 rounds)
  3. Create User
  4. Create Account (provider: "credentials")
  5. Auto sign-in

**signInWithCredentials**
- Schema: `SignInSchema`
- Flow:
  1. Find user by email
  2. Find credentials account
  3. Verify password with bcrypt
  4. Sign in via NextAuth

---

## API Routes (app/api/)

### REST API Pattern

API routes return standardized responses:

```typescript
// Success
NextResponse.json({ success: true, data: result }, { status: 200 });

// Error (via handleError)
NextResponse.json({
  success: false,
  error: { message: "...", details: {...} }
}, { status: 400/404/500 });
```

### Endpoints

**Users (`/api/users`)**
- `GET /` - Get all users
- `POST /` - Create user
- `GET /[id]` - Get user by ID
- `PUT /[id]` - Update user
- `DELETE /[id]` - Delete user
- `POST /email` - Get user by email

**Accounts (`/api/accounts`)**
- `GET /` - Get all accounts
- `POST /` - Create account
- `GET /[id]` - Get account by ID
- `PUT /[id]` - Update account
- `DELETE /[id]` - Delete account
- `POST /provider` - Get account by providerAccountId

**Auth (`/api/auth`)**
- `GET/POST /[...nextauth]` - NextAuth handlers
- `POST /signin-with-oauth` - OAuth sign-in transaction handler

**AI (`/api/ai/answers`)**
- `POST /` - Generate AI answer
  - Params: `{ question, content, userAnswer }`
  - Calls Groq API with LLaMA 3.1
  - Returns: markdown-formatted answer

### API Client (`lib/api.ts`)

Wrapper for client-side API calls:

```typescript
export const api = {
  auth: {
    oAuthSignIn: (params) => fetchHandler(`${API_BASE_URL}/auth/signin-with-oauth`, { ... })
  },
  users: {
    getAll, getById, getByEmail, create, update, delete
  },
  accounts: {
    getAll, getById, getByProvider, create, update, delete
  },
  ai: {
    getAnswer: (question, content, userAnswer) => fetchHandler(`${API_BASE_URL}/ai/answers`, { ... })
  }
};
```

**Usage:**
```typescript
const { success, data, error } = await api.ai.getAnswer(questionTitle, questionContent, userAnswer);
```

---

## Caching & Revalidation

### Next.js Caching Strategy

**Server Components (default: cached)**
- Page components fetch data on server
- Data cached until revalidation

**Revalidation Triggers:**
```typescript
import { revalidatePath } from "next/cache";

// After mutation
revalidatePath(ROUTES.QUESTION(questionId)); // Refresh question page
revalidatePath(ROUTES.HOME); // Refresh home page
```

**Dynamic Routes (no cache):**
```typescript
export const dynamic = "force-dynamic"; // Opt out of caching
```

**View Increment (after() API):**
```typescript
import { after } from "next/server";

// In question detail page
after(async () => {
  await incrementViews({ questionId: id });
});
// Runs after response sent, doesn't block render
```

### MongoDB Connection Caching

```typescript
// lib/mongoose.ts
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
  if (cached.conn) return cached.conn; // Reuse connection
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "devflow" });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};
```

---

## State Management

### No Global State Library

The project uses React's built-in state management:

**Server State:**
- Fetched in Server Components
- Passed as props to Client Components

**Client State:**
- `useState` for local UI state (loading, form inputs)
- `useTransition` for pending states during server actions
- URL search params for filters/pagination

**Example: Filter State**
```typescript
// components/filters/CommonFilter.tsx
"use client";

const CommonFilter = ({ filters }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || filters[0].value;
  
  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });
    router.push(newUrl, { scroll: false }); // Update URL, trigger refetch
  };
};
```

**Example: Form State**
```typescript
// components/forms/QuestionForm.tsx
"use client";

const QuestionForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: { title: "", content: "", tags: [] },
  });
  
  const handleCreateQuestion = async (data) => {
    startTransition(async () => {
      const result = await createQuestion(data);
      if (result.success) {
        router.push(ROUTES.QUESTION(result.data._id));
      }
    });
  };
};
```

---

## Server vs Client Components

### Component Classification

**Server Components (Default):**
- Pages (`app/**page.tsx`)
- Layouts (`app/**/layout.tsx`)
- Data fetching components
- Cards, DataRenderer, Metric, UserAvatar

**Client Components (`"use client"`):**
- Forms (AuthForm, QuestionForm, AnswerForm)
- Interactive filters (CommonFilter, HomeFilter)
- Search (LocalSearch)
- Votes
- Navigation (MobileNavigation, Theme toggle)
- Editor (MDXEditor)

### Pattern: Server Component with Client Islands

```typescript
// Server Component (page.tsx)
const QuestionDetails = async ({ params }) => {
  const question = await getQuestion({ questionId: id });
  
  return (
    <>
      <h2>{question.title}</h2>
      <Preview content={question.content} /> {/* Server Component */}
      
      <Suspense fallback={<div>Loading...</div>}>
        <Votes /* Client Component */ 
          targetId={question._id}
          upvotes={question.upvotes}
          hasVotedPromise={hasVoted({ targetId: question._id })} // Server action
        />
      </Suspense>
      
      <AnswerForm /* Client Component */ 
        questionId={question._id}
      />
    </>
  );
};
```

### Async Server Components

All page components and data-fetching components are async:

```typescript
const Home = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams; // Next.js 15 async params
  const { success, data, error } = await getQuestions({ page, pageSize, query, filter });
  
  return (
    <DataRenderer
      success={success}
      data={data?.questions}
      render={(questions) => questions.map((q) => <QuestionCard question={q} />)}
    />
  );
};
```

---

## Business Logic & Workflows

### Create Question Workflow

1. User navigates to `/ask-question` (protected)
2. Fills QuestionForm (title, content, tags)
3. On submit:
   - Validate with `AskQuestionSchema`
   - Call `createQuestion` server action
   - Transaction:
     - Create Question doc
     - For each tag: upsert Tag, increment count, create TagQuestion
     - Update Question with tag IDs
   - Redirect to new question page

### Vote Workflow

1. User clicks upvote/downvote on question/answer
2. Check auth → toast if not logged in
3. Call `createVote` server action
4. Transaction:
   - Find existing vote for this user + target
   - **No existing vote:** Create new vote, +1 to count
   - **Same vote exists:** Delete vote, -1 to count
   - **Opposite vote exists:** Update vote type, -1 old count, +1 new count
5. Revalidate question page
6. UI updates automatically

### AI Answer Generation Workflow

1. User clicks "Generate AI Answer" in AnswerForm
2. Check auth → toast if not logged in
3. Get current answer content from editor
4. Call `/api/ai/answers` endpoint:
   ```typescript
   const { success, data } = await api.ai.getAnswer(
     questionTitle,
     questionContent,
     userAnswer // Optional, existing draft
   );
   ```
5. Backend calls Groq API:
   ```typescript
   POST https://api.groq.com/openai/v1/chat/completions
   {
     model: "llama-3.1-8b-instant",
     messages: [
       { role: "system", content: "You are a helpful assistant..." },
       { role: "user", content: "Generate answer for: {question}..." }
     ]
   }
   ```
6. Sanitize response (remove `<hr>` tags)
7. Set editor content to AI-generated markdown
8. User can edit and submit

### Edit Question Workflow

1. User clicks edit on their own question
2. Redirect to `/questions/[id]/edit`
3. Check auth + ownership:
   ```typescript
   if (question.author.toString() !== session.user.id) {
     redirect(ROUTES.QUESTION(id)); // Not author, redirect to view
   }
   ```
4. Load QuestionForm with existing data
5. On submit:
   - Validate with `EditQuestionSchema`
   - Call `editQuestion` server action
   - Transaction:
     - Update title/content if changed
     - Calculate tag diff (add/remove)
     - Update Tag counts, TagQuestion junctions
     - Save Question
6. Redirect to updated question page

---

## Styling System

### Tailwind CSS v4 Custom Tokens

**Theme Definition (`app/globals.css`):**
```css
@theme {
  --color-primary-100: #fff1e6;
  --color-primary-500: #ff7000;
  
  --color-dark-100: #000000;
  --color-dark-200: #0f1117;
  /* ... */
  
  --color-light-800: #f4f6f8;
  --color-light-900: #ffffff;
  
  --shadow-light-100: 0px 12px 20px 0px rgba(184, 184, 184, 0.03);
  /* ... */
}
```

### Custom Utility Classes

**Dynamic Theme Utilities:**
```css
@utility background-light850_dark100 {
  @apply bg-light-850 dark:bg-dark-100;
}

@utility text-dark100_light900 {
  @apply text-dark-100! dark:text-light-900!;
}

@utility primary-gradient {
  background: linear-gradient(129deg, #ff7000 0%, #e2995f 100%);
}
```

**Typography:**
```css
@utility h1-bold {
  @apply text-[30px] font-bold leading-[42px] tracking-tighter;
}

@utility paragraph-semibold {
  @apply text-[16px] font-semibold leading-[20.8px];
}
```

**Layouts:**
```css
@utility flex-center {
  @apply flex justify-center items-center;
}

@utility card-wrapper {
  @apply bg-light-900 dark:dark-gradient shadow-light-100 dark:shadow-dark-100;
}
```

### Dark Mode Implementation

**Provider Setup (`app/layout.tsx`):**
```typescript
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Theme Toggle (`components/navigation/navbar/Theme.tsx`):**
```typescript
"use client";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Sun className="dark:scale-0" />
        <Moon className="scale-0 dark:scale-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Editor Theme Switching

**MDX Editor (`components/editor/index.tsx`):**
```typescript
"use client";
import { useTheme } from "next-themes";
import { basicDark } from "cm6-theme-basic-dark";

const Editor = ({ value, editorRef, fieldChange }) => {
  const { resolvedTheme } = useTheme();
  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
  
  return (
    <MDXEditor
      key={resolvedTheme} // Re-render on theme change
      plugins={[
        codeMirrorPlugin({ codeMirrorExtensions: themeExtension })
      ]}
    />
  );
};
```

---

## Error Handling

### Standardized Error System

**Error Classes (`lib/http-errors.ts`):**
```typescript
class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
}

class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatFieldErrors(fieldErrors);
    super(400, message, fieldErrors);
  }
}

class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

class UnauthorizedError extends RequestError {
  constructor() {
    super(401, "Unauthorized");
  }
}
```

**Error Handler (`lib/error.ts`):**
```typescript
const handleError = (error: unknown, responseType: "api" | "server" = "server") => {
  if (error instanceof RequestError) {
    return formatResponse(responseType, error.statusCode, error.message, error.errors);
  }
  
  if (error instanceof ZodError) {
    const validationError = new ValidationError(error.flatten().fieldErrors);
    return formatResponse(responseType, validationError.statusCode, ...);
  }
  
  return formatResponse(responseType, 500, "An unexpected error occurred");
};
```

### Usage in Server Actions

```typescript
export async function createQuestion(params) {
  try {
    const validationResult = await action({ params, schema: AskQuestionSchema, authorize: true });
    
    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }
    
    // ... logic
    
    return { success: true, data: question };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
```

### Usage in API Routes

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);
    
    // ... logic
    
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
```

### UI Error Display

**DataRenderer Component:**
```typescript
const DataRenderer = ({ success, error, data, empty, render }) => {
  if (!success) {
    return (
      <StateSkeleton
        image={{ light: "/images/light-error.png", dark: "/images/dark-error.png" }}
        title={error?.message || "Something Went Wrong"}
        message={error?.details ? JSON.stringify(error.details, null, 2) : "..."}
      />
    );
  }
  
  if (!data || data.length === 0) {
    return <StateSkeleton {...empty} />;
  }
  
  return render(data);
};
```

**Toast Notifications:**
```typescript
import { toast } from "sonner";

// Success
toast("Success", {
  description: "Your answer has been posted successfully",
});

// Error
toast("Error", {
  description: result.error?.message,
});
```

---

## Environment Variables

### Required Variables (`.env.local`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth.js
AUTH_SECRET=your_random_secret_key

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant  # Optional, default shown

# App URL (for API calls)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api  # Dev
# NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api  # Production
```

### Usage Patterns

**Server-side only:**
```typescript
const apiKey = process.env.GROQ_API_KEY; // Server Action/API Route
const mongoUri = process.env.MONGODB_URI;
```

**Client-side accessible:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
```

---

## Coding Conventions

### File Naming
- **Components:** PascalCase (`QuestionCard.tsx`, `LeftSidebar.tsx`)
- **Utils/Actions:** camelCase (`question.action.ts`, `utils.ts`)
- **Models:** kebab-case (`user.model.ts`, `tag-question.model.ts`)
- **Constants:** camelCase (`routes.ts`, `filters.ts`)

### Component Structure
```typescript
// 1. Imports (grouped: React, Next, Third-party, Local)
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createQuestion } from "@/lib/actions/question.action";

// 2. Types/Interfaces
interface Props {
  question?: Question;
  isEdit?: boolean;
}

// 3. Component
const QuestionForm = ({ question, isEdit = false }: Props) => {
  // 4. Hooks
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 5. Handlers
  const handleSubmit = async (data) => { ... };
  
  // 6. Render
  return ( ... );
};

// 7. Export
export default QuestionForm;
```

### Async/Await Pattern
```typescript
// Server Actions - always async
export async function getQuestions(params) {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });
  
  try {
    const questions = await Question.find().populate("tags").sort();
    return { success: true, data: questions };
  } catch (error) {
    return handleError(error);
  }
}

// Client Components - useTransition
const handleSubmit = async (data) => {
  startTransition(async () => {
    const result = await createQuestion(data);
    if (result.success) { ... }
  });
};
```

### Type Definitions (`types/*.d.ts`)
- **No imports/exports** (ambient declarations)
- Global types accessible everywhere
- Organized by domain (action.d.ts, global.d.ts)

### Path Aliases (`tsconfig.json`)
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Usage:**
```typescript
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import { createQuestion } from "@/lib/actions/question.action";
```

---

## Unfinished/Unused Features

### Implemented but Unused

1. **Collection System** (`database/collection.model.ts`)
   - Model exists for bookmarking questions
   - No UI implementation
   - Constants defined (`EMPTY_COLLECTIONS`)
   - Ready to implement save/bookmark feature

2. **Interaction Model** (`database/interaction.model.ts`)
   - Tracks user actions (view, upvote, search, etc.)
   - Not actively used for analytics
   - Could power recommendation engine

3. **User Reputation** (`User.reputation`)
   - Field exists in User model
   - Not calculated or displayed
   - Could track upvotes, accepted answers, etc.

4. **Profile System**
   - NavLink mentions `/profile` route
   - Not implemented in routing
   - User model has `bio`, `location`, `portfolio` fields

5. **Jobs Feature**
   - Sidebar link commented out
   - Type definitions exist (`Job`, `JobFilterParams`)
   - Could integrate with jobs API

6. **Global Search**
   - Schema defined (`GlobalSearchSchema`)
   - Type: `GlobalSearchedItem`
   - No UI component

7. **Badge System**
   - Constants: `BADGE_CRITERIA` (bronze/silver/gold)
   - Type: `Badges`
   - Not implemented in UI

### Commented Out Routes

```typescript
// constants/index.ts - sidebarLinks
// {
//   imgURL: "/icons/star.svg",
//   route: "/collection",
//   label: "Collections",
// },
// {
//   imgURL: "/icons/suitcase.svg",
//   route: "/jobs",
//   label: "Find Jobs",
// },
// {
//   imgURL: "/icons/user.svg",
//   route: "/profile",
//   label: "Profile",
// },
```

---

## Performance Considerations

### Database Optimization

**Indexes (should be added):**
```typescript
// Recommended indexes for production
User: { email: 1, username: 1 }
Account: { providerAccountId: 1, provider: 1 }
Question: { author: 1, createdAt: -1, upvotes: -1 }
Answer: { question: 1, author: 1 }
Tag: { name: 1 }
Vote: { author: 1, actionId: 1, actionType: 1 }
```

**Populated Queries:**
```typescript
// Efficient: only select needed fields
Question.find()
  .populate("tags", "name") // Only tag names
  .populate("author", "name image") // Only author name/image
  .lean() // Return plain objects (faster)
```

### Server Component Performance

**Parallel Data Fetching:**
```typescript
// Good: parallel fetches
const [questionsResult, tagsResult] = await Promise.all([
  getQuestions({ ... }),
  getTopTags(),
]);

// Bad: sequential
const questions = await getQuestions({ ... });
const tags = await getTopTags();
```

**Suspense Boundaries:**
```typescript
<Suspense fallback={<div>Loading votes...</div>}>
  <Votes hasVotedPromise={hasVoted({ ... })} />
</Suspense>

// Votes component uses React.use() to unwrap promise
const { data } = use(hasVotedPromise);
```

### Client Component Optimization

**Debounced Search:**
```typescript
// components/search/LocalSearch.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery) {
      router.push(formUrlQuery({ key: "query", value: searchQuery }));
    }
  }, 300); // 300ms debounce
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

**Dynamic Imports:**
```typescript
// components/forms/QuestionForm.tsx
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false, // Only load on client
});
```

### Image Optimization

**Next.js Image Component:**
```typescript
import Image from "next/image";

<Image
  src={author.image}
  alt={author.name}
  width={100}
  height={100}
  quality={100}
  className="object-cover"
/>
```

**Remote Patterns (`next.config.ts`):**
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "avatars.githubusercontent.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ],
}
```

---

## How to Safely Continue Development

### Before Making Changes

1. **Review Related Files**
   - If editing a model → check actions using it
   - If editing an action → check pages/components calling it
   - If editing a component → check parent components

2. **Test in Development**
   ```bash
   npm run dev
   # Test affected flows manually
   ```

3. **Check Type Safety**
   ```bash
   npm run lint
   # TypeScript will catch interface mismatches
   ```

### Adding New Features

#### Example: Add User Profile Page

1. **Create Route:**
   ```typescript
   // app/(root)/profile/[id]/page.tsx
   const Profile = async ({ params }: RouteParams) => {
     const { id } = await params;
     const session = await auth();
     
     // Fetch user data
     const { success, data: user } = await getUser({ userId: id });
     
     return (
       <div>
         <h1>{user.name}</h1>
         {/* Display bio, location, portfolio, reputation */}
       </div>
     );
   };
   ```

2. **Create Server Action:**
   ```typescript
   // lib/actions/user.action.ts
   export async function getUser(params: GetUserParams) {
     const validationResult = await action({ params, schema: GetUserSchema });
     
     try {
       const user = await User.findById(params.userId);
       if (!user) throw new NotFoundError("User");
       
       return { success: true, data: JSON.parse(JSON.stringify(user)) };
     } catch (error) {
       return handleError(error);
     }
   }
   ```

3. **Add Validation Schema:**
   ```typescript
   // lib/validations.ts
   export const GetUserSchema = z.object({
     userId: z.string().min(1, "User ID is required"),
   });
   ```

4. **Update Types:**
   ```typescript
   // types/action.d.ts
   interface GetUserParams {
     userId: string;
   }
   ```

5. **Update Navigation:**
   ```typescript
   // constants/index.ts - uncomment profile link
   {
     imgURL: "/icons/user.svg",
     route: "/profile",
     label: "Profile",
   },
   ```

### Database Migrations

**Adding Field to Model:**
```typescript
// 1. Update model schema
const UserSchema = new Schema({
  // ... existing fields
  githubUrl: { type: String }, // New field
});

// 2. Migration (if needed)
// MongoDB is schemaless, so just update the model
// Existing docs will have githubUrl: undefined

// 3. Update types
interface IUser {
  // ... existing fields
  githubUrl?: string;
}
```

### Testing Transaction Changes

```typescript
// Always use try-catch-finally pattern
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. All DB operations
  await User.create([data], { session });
  await Account.create([accountData], { session });
  
  // 2. Commit if all succeed
  await session.commitTransaction();
  
  return { success: true };
} catch (error) {
  // 3. Rollback on error
  await session.abortTransaction();
  return handleError(error);
} finally {
  // 4. Always close session
  await session.endSession();
}
```

### Adding API Endpoint

```typescript
// app/api/questions/route.ts
import { NextResponse } from "next/server";
import handleError from "@/lib/error";
import { Question } from "@/database";

export async function GET() {
  try {
    await dbConnect();
    const questions = await Question.find().limit(10);
    
    return NextResponse.json(
      { success: true, data: questions },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
```

### Updating Existing Flow

**Example: Add answer editing**

1. **Create Edit Route:**
   ```typescript
   // app/(root)/answers/[id]/edit/page.tsx
   ```

2. **Add Edit Action:**
   ```typescript
   // lib/actions/answer.action.ts
   export async function editAnswer(params: EditAnswerParams) { ... }
   ```

3. **Add Schema:**
   ```typescript
   // lib/validations.ts
   export const EditAnswerSchema = AnswerSchema.extend({
     answerId: z.string().min(1),
   });
   ```

4. **Update AnswerCard:**
   ```typescript
   // components/cards/AnswerCard.tsx
   {session?.user?.id === author._id && (
     <Link href={ROUTES.EDIT_ANSWER(answer._id)}>Edit</Link>
   )}
   ```

5. **Add Route Constant:**
   ```typescript
   // constants/routes.ts
   EDIT_ANSWER: (id: string) => `/answers/${id}/edit`,
   ```

---

## Key Files Reference

### Configuration
- `next.config.ts` - Next.js config (images, TypeScript, ESLint)
- `tsconfig.json` - TypeScript config with path aliases
- `tailwind.config.js` - Tailwind v4 theme (via `@theme` in CSS)
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `package.json` - Dependencies and scripts
- `.eslintrc.json` - ESLint config
- `.gitignore` - Git ignore rules
- `middleware.ts` - Auth middleware (exports `auth`)

### Authentication
- `auth.ts` - NextAuth v5 configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `app/api/auth/signin-with-oauth/route.ts` - OAuth transaction handler
- `lib/actions/auth.action.ts` - Sign up/in server actions

### Database
- `lib/mongoose.ts` - MongoDB connection with caching
- `database/*.model.ts` - 9 Mongoose models
- `database/index.ts` - Model exports

### Core Logic
- `lib/actions/*.action.ts` - Server actions (question, answer, vote, user, tag, auth)
- `lib/handlers/action.ts` - Action wrapper (validate, authorize, connect DB)
- `lib/handlers/fetch.ts` - Client-side fetch wrapper
- `lib/api.ts` - API client (users, accounts, auth, AI)

### Validation & Errors
- `lib/validations.ts` - All Zod schemas
- `lib/http-errors.ts` - Custom error classes
- `lib/error.ts` - Error handler (server/API)

### UI Components
- `components/forms/` - 4 form components
- `components/cards/` - 4 card components
- `components/navigation/` - 5 navigation components
- `components/editor/` - MDX editor + preview
- `components/ui/` - 10 shadcn/ui primitives
- `components/DataRenderer.tsx` - Generic data renderer

### Constants & Types
- `constants/routes.ts` - Route definitions
- `constants/filters.ts` - Filter options
- `constants/states.ts` - Empty/error states
- `constants/techMap.ts` - Tech icons mapping
- `types/action.d.ts` - Action param types
- `types/global.d.ts` - Global types

### Utilities
- `lib/utils.ts` - Helper functions (cn, getTimeStamp, formatNumber, tech utils)
- `lib/url.ts` - URL query manipulation
- `lib/theme-provider.tsx` - Next-themes wrapper

### Styles
- `app/globals.css` - Global styles, Tailwind theme, custom utilities
- `components/editor/dark-editor.css` - MDX editor dark theme

---

## Summary

DevFlow is a well-structured Next.js 15 application leveraging server components, server actions, and MongoDB for a modern Q&A platform. Key architectural decisions:

- **Server-first:** Data fetching in Server Components, mutations via Server Actions
- **Transaction safety:** Mongoose sessions for multi-document operations
- **Type safety:** Zod validation + TypeScript interfaces
- **Authentication:** NextAuth v5 with multiple providers
- **Styling:** Tailwind v4 with custom design tokens
- **Error handling:** Standardized error classes + handler
- **Caching:** Next.js revalidation + MongoDB connection pooling

