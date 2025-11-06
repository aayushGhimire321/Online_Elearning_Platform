## Online Learning Platform — AI-powered courses

This repository contains an AI-powered fullstack online learning platform built with Next.js, React, Tailwind (Tailwind CSS + shadcn UI), Clerk authentication + billing, Drizzle ORM + Neon Postgres, and Google Gemini / other AI services for course generation and images. The app lets users generate complete courses with AI, edit them, generate content and banners, enroll, and track progress.

This README summarizes the project, how to run it locally, required environment variables, the main flows, and deployment notes.

## Key Features
- Generate course layout (chapters & topics) with an LLM (Gemini / OpenRouter)
- Generate course banner images via an image API (example: AI guru / other free image APIs)
- Save layouts & content to Postgres (Neon) via Drizzle ORM
- Authentication + subscription billing with Clerk (signup/signin, subscription UI)
- YouTube integration to fetch related videos for each topic
- Course editing, final content generation, enrollments, and learning progress tracking
- Sidebar, workspace dashboard, course editor, and student view UI built with Tailwind + shadcn

## Tech stack
- Next.js (App Router)
- React
- Tailwind CSS, shadcn/ui
- Clerk (authentication + subscription billing)
- Neon Postgres (hosted Postgres)
- Drizzle ORM / Drizzle Kit (migrations & studio)
- Google Gemini / OpenRouter (LLM for course layout & content)
- AI image API (for banners) — example used in transcript: AIGuruLab/Flux
- YouTube Data API v3 (search videos)
- Axios for HTTP client

## Project structure (high level)
- `app/` — Next.js App Router pages & layouts
  - `workspace/` — main dashboard routes (sidebar, course editor, billing, profile, explore)
  - `api/` — server API route handlers (generate layouts, generate content, enroll, courses, etc.)
- `public/` — static assets (logos, images)
- `config/` — DB initialization and Drizzle schema (e.g. `db.js`, `schema.js`)

## Quick setup (development)

Prerequisites:
- Node.js (>=18 recommended)
- Git
- An account / credentials for the external services you want to use (Clerk, Neon, Google Cloud/YouTube API, Gemini/OpenRouter API, image API)

1) Install dependencies

```powershell
npm install
```

2) Create environment variables

Create an `.env.local` in the repository root and add the keys required by the app. Example variables (replace values with your own keys):

```
# Neon / Postgres
DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Clerk
CLERK_SECRET_KEY="<your-clerk-secret>"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-clerk-publishable>"

# Google / Gemini or OpenRouter
GEN_AI_API_KEY="<gemini-or-openrouter-key>"

# Image generation API (optional)
IMAGE_API_KEY="<image-api-key>"

# YouTube Data API
YOUTUBE_API_KEY="<your-youtube-api-key>"

```

Note: The exact environment variable names used by the app can vary — check the code (`config/`, `app/api/*`) for the precise variable names the project reads (some examples: `DATABASE_URL`, `GEN_AI_API_KEY`, `YOUTUBE_API_KEY`, Clerk keys).

3) Database setup (Drizzle + Neon)

If you use Drizzle (project includes Drizzle kit & schema), push schema changes and run the local studio:

```powershell
npx drizzle-kit push
npx drizzle-kit studio
```

4) Run the dev server

```powershell
npm run dev
# Open http://localhost:3000
```

## Important workflows (how the app works)

- User signs up / signs in using Clerk. Middleware protects workspace routes; login pages are configured under `app/(auth)`.
- New course creation:
  - User opens Create Course dialog in the workspace.
  - Client POSTs form data to `/api/generate-course-layout`.
  - Server calls the LLM (Gemini/OpenRouter) with a structured prompt to generate a JSON course layout (chapters, topics, banner prompt).
  - The server optionally generates a banner image (image API) using the banner prompt.
  - Insert the course record (metadata + course JSON + banner URL) into Postgres via Drizzle.
  - Redirect user to the course editor (`/workspace/edit-course/[courseId]`).

- Course editing and content generation:
  - From the editor, the user can request final content generation.
  - Server calls the LLM per-chapter (or streaming) to create detailed content for all topics.
  - The server optionally fetches related YouTube videos per-topic using the YouTube Data API.
  - Save the generated content JSON into the `courses` table as `course_content`.

- Enrollment & progress:
  - A user can enroll into a course; enrollments are stored in an `enroll_courses` table linking user email and course id.
  - While learning, users mark chapters as completed (updates `completed_chapters` array/JSON for the enrollment).
  - UI shows progress (percentage) computed from completed chapters vs total chapters.

- Billing / subscription:
  - Clerk handles authentication and subscription billing.
  - Plans are configured on the Clerk dashboard; Clerk's subscription UI is embedded on the `workspace/billing` page.
  - Server-side middleware can check Clerk subscription access for protected actions (e.g., limiting free-tier course creations to 1 for non-subscribers).

## Environment & API Keys — details and notes

- Clerk: Create a Clerk application and copy the publishable & secret keys to your env file. Use Clerk's Next.js SDK for frontend and Clerk server helpers for server checks (permission checks).
- Neon / Postgres: Create a Neon DB, copy the connection string to `DATABASE_URL` and run Drizzle migrations (drizzle-kit push).
- Google Gemini or OpenRouter (LLM): Create an API key and put it in `GEN_AI_API_KEY`. The server makes requests to the SDK / endpoint to generate layouts/content.
- YouTube Data API: Enable the YouTube Data API v3 in Google Cloud, create an API key and set `YOUTUBE_API_KEY`.
- Image API: Any image generation API with a key will work; examples used during development include AI GuruLab/Flux. Save the API key in `IMAGE_API_KEY`.

Security note: Never commit keys to source control. Use environment variables on Vercel or your deployment platform.

## Deployment

1) Push your repo to GitHub

```powershell
git add .
git commit -m "chore: initial commit"
git push origin main
```

2) Deploy to Vercel (recommended for Next.js App Router)
  - Connect your GitHub repo to Vercel
  - Add the environment variables in Vercel dashboard (copy the same keys you used in .env.local)
  - Vercel auto-detects Next.js and will build & deploy on push.

3) Production Clerk setup
  - In Clerk, switch to a production instance for your deployed domain and ensure redirect URIs are set.
  - If you use Stripe for real payments, connect Stripe to Clerk billing in production.

## Scripts & commands
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Start (production): `npm start` (depends on scripts in `package.json`)
- Drizzle migrations: `npx drizzle-kit push`
- Drizzle studio: `npx drizzle-kit studio`

## Tips & troubleshooting
- If Tailwind/shadcn components don't render after installing, restart the dev server.
- For Next/Image to load third-party URLs, add domains to `next.config.mjs` under `images.domains`.
- If you see server-side errors while generating content, check the server logs for the LLM API response shape and ensure the code parses the returned JSON or text correctly.

## Contributing
- Improve prompts and output schema for the LLMs to get more accurate course structures.
- Add tests for API endpoints and sample prompt/responses.
- Add RBAC and more robust quota checks for free-tier users.

## Credits
- Transcript & tutorial content from the original video author
- UI mockups generated using UIUXmockup (as used in project)

---
If anything in the README is unclear or you want this split into smaller HOWTO docs, tell me what to focus on next (env examples, sample prompt file, or a migration script).
# 🎓 Online_Elearning_Platform

**Online_Elearning_Platform** is an AI-powered e-learning website designed to provide personalized, engaging, and adaptive education experiences. Built with the **MERN stack**, it integrates artificial intelligence to analyze student performance, recommend learning paths, and automate assessments.

---

## 🚀 Features

### 👩‍🏫 Core Learning
- Course creation and management (videos, PDFs, interactive content)
- Quizzes, assignments, and progress tracking
- Gamified achievements and completion certificates

### 🤖 AI-Driven Components
- **Smart Recommendations:** Suggests personalized courses based on user behavior and interests  
- **AI Quiz Generator:** Auto-generates practice questions and tests  
- **Chatbot Tutor:** AI assistant for real-time learning support and Q&A  
- **Performance Insights:** AI analyzes learner data to provide improvement feedback  

### 💡 User Management
- Role-based access for Admin, Instructor, and Student  
- Secure authentication and authorization using JWT/OAuth  
- Profile customization and learning preference settings  

### 📊 Analytics
- Interactive dashboards for students, instructors, and admins  
- AI-based trend analysis and at-risk learner detection  

### 💳 Payments & Certificates
- Integrated payment gateway (e.g., Khalti / Stripe / PayPal)
- Auto-generated digital certificates upon course completion  

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / Next.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI Integration** | Python (Flask API) / OpenAI API / TensorFlow |
| **Authentication** | JWT / OAuth 2.0 / Firebase Auth |
| **Hosting** | Vercel / Render / AWS / DigitalOcean |

---

## ⚙️ Setup Instructions

1. **Clone the Repository**
   
   git clone https://github.com/yourusername/Online_Elearning_Platform.git
   cd Online_Elearning_Platform

2. **Install Dependencies**
npm install
cd client && npm install

3. **Environment Variables**

Create a .env file in the root directory and include:

MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_secret>
OPENAI_API_KEY=<your_openai_api_key>


4. **Run the Application**

# Start backend
npm run server

# Start frontend
cd client && npm start


5. **Access**
Open http://localhost:3000 in your browser.



**🧠 Future Enhancements**
   1. Real-time video lectures with AI-assisted note summaries
   2. Emotion recognition for adaptive teaching
   3. Voice-based commands and speech-to-text input
   4. AI plagiarism detection for assignments


**📄 License**
This project is licensed under the MIT License.

**🤝 Contributing**
Contributions are welcome!
Please fork the repo, create a new branch, and submit a pull request.

**🌟 Acknowledgments**
1. OpenAI for NLP integration
2. TensorFlow for analytics and prediction models
3. MongoDB Atlas for cloud database
4. Tailwind CSS for modern UI styling


**💬 Contact**
Developed by Aayush Ghimire
📧 Email: aghimire781@gmail.com










