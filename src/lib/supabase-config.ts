// Supabase config — uses environment variables when available
// ⚠️  IMPORTANT: The hardcoded fallback below is for demo/static builds only.
//     For production, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
//     via GitHub Secrets or your deployment platform.
//
// 🔒  SECURITY NOTE: The RLS policy in supabase-schema.sql now enforces:
//     - Content length: 1-280 characters
//     - Rate limit: max 1 message per username per 10 seconds
//     - Auto-cleanup: delete messages older than 24 hours (see cron options in SQL)
//
//     However, the anon key IS client-side visible — determined abusers can still:
//     - Rotate usernames to bypass per-user rate limits
//     - For production with public chat, consider:
//       (a) Cloudflare Turnstile / hCaptcha
//       (b) Supabase Edge Functions for stricter validation
//       (c) Signed JWTs via auth provider

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rejqnptjcdxfdajqbmvl.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ihub-WbVb8on-Zj8zjOoWw_eg-eMG8y'
