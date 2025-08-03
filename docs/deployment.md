# Deployment & CI/CD

## Local Build
- Run `pnpm build` to create a production build of the frontend.
- Ensure `.env.local` is configured with Supabase keys.

## Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Manual Deployment (MVP)
- Deploy the `dist/` folder to your static hosting provider (e.g., Vercel, Netlify, S3).
- Set environment variables in your hosting dashboard.
- No automated CI/CD pipeline is required for MVP.

## Future Improvements
- Add GitHub Actions or similar for automated deploys.
- Add staging/production environment separation. 