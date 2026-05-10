// Supabase config — uses environment variables when available
// FALLBACK: Hardcoded anon key for static builds (safe for client-side, no RLS write)
// IMPORTANT: For production, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rejqnptjcdxfdajqbmvl.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ihub-WbVb8on-Zj8zjOoWw_eg-eMG8y'
