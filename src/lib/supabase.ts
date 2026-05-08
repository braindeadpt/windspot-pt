import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config'

// Cliente Supabase para o browser
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Verifica se Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY
}