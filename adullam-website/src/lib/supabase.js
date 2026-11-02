import { createClient } from '@supabase/supabase-js'

const viteEnvironment = import.meta.env || {}

export const supabaseUrl = viteEnvironment.VITE_SUPABASE_URL
export const supabasePublishableKey = viteEnvironment.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
