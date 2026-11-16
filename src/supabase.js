import { createClient } from '@supabase/supabase-js'

export const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const emailDe = u => u.trim().toLowerCase() + '@fime.app'
export const validUser = u => /^[a-z0-9._-]{3,30}$/.test(u)