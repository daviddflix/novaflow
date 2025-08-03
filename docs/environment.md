# Environment & Config

## .env.local
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
- Store these securely. Never commit real secrets to version control.

## RLS Enablement
- Enable Row-Level Security for all tables in Supabase Studio.

## Seeding Data
- Use Supabase SQL editor or Studio to seed initial data (users, workspaces, tasks).

## Secrets Management
- Store secrets securely in Vercel/Netlify dashboard if deploying in the future.

## Production
- No production instance for MVP. All development is local. 