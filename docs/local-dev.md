# Local Development

## Prerequisites
- Node.js (v18+ recommended)
- pnpm
- Supabase account and project

## Setup Steps
1. Clone the repo:
   ```sh
   git clone <repo-url>
   cd internal-collaboration-platform
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Copy and configure environment variables:
   ```sh
   cp .env.local.example .env.local
   # Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
4. Start the dev server:
   ```sh
   pnpm dev
   ```
5. Use Supabase Studio to:
   - Create tables and RLS policies (see `docs/supabase-schema.md` and `docs/rls-policies.md`)
   - Seed test data (users, workspaces, tasks)
   - Monitor real-time events

## References
- [Supabase Quickstart](https://supabase.com/docs/guides/with-react) 