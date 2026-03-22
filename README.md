# AI Career Analyzer

AI-powered career analysis platform to evaluate Resume, LinkedIn, and GitHub profiles with actionable feedback, scoring, and report export.

Frontend design is built with **v0.dev** and adapted for this project.

## Features

- Resume Analyzer (PDF)
  - ATS score
  - Job match percentages
  - Missing keywords
  - AI-generated strengths, improvements, and vibe feedback
- LinkedIn Analyzer (PDF)
  - Profile strength score
  - Section-by-section scoring
  - AI-generated strengths, improvements, and vibe feedback
- GitHub Analyzer (username)
  - Repo and profile stats via GitHub API
  - README/language insights
  - AI-generated strengths, improvements, and vibe feedback
- Dashboard + History
  - Saves analysis records to Supabase
  - View report details
  - Export reports as PDF

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- Google Generative AI (Gemini)
- GitHub REST API
- jsPDF (PDF export)
- pdfjs-dist (PDF text extraction)

## Project Structure

- `app/` - Next.js routes, API, dashboard pages
- `components/` - UI + dashboard components
- `lib/supabase/` - Supabase client/server/middleware helpers
- `lib/pdf/` - PDF extraction utilities
- `lib/report/` - PDF report export utility
- `scripts/` - SQL setup scripts

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project
- Google AI API key
- GitHub token (recommended for higher API limits)

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
GITHUB_TOKEN=...
```

Notes:
- `GITHUB_TOKEN` is server-side and shared by all users (recommended for rate limits).
- `.env.local` is ignored by git.

## Supabase Setup

Run SQL scripts in Supabase SQL Editor:

1. `scripts/001_create_schema.sql`
2. `scripts/002_create_profile_trigger.sql`

This creates:
- `public.profiles`
- `public.analysis_results`
- RLS policies + indexes
- auto profile creation trigger

## Run Locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Usage Flow

1. Register/Login
2. Go to Dashboard
3. Run Resume / LinkedIn / GitHub analysis
4. Review results and suggestions
5. Open History and export PDF reports

## Troubleshooting

- GitHub analyzer shows rate-limit message:
  - Add/refresh `GITHUB_TOKEN` in `.env.local`
  - Restart dev server
- History not saving:
  - Ensure Supabase SQL scripts were executed
  - Confirm env vars are correct
- AI quota errors:
  - Verify Gemini API key and quota/billing in Google AI Studio/Cloud
- LinkedIn/Resume feels generic:
  - Upload text-based PDFs (not scanned image PDFs)

## Security

- Never commit `.env.local` or API keys
- Rotate exposed keys immediately if leaked

## License

For personal or demo use. Add your preferred license before public release.
