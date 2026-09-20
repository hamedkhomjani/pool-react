import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxacekazmicvhecfecij.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T9YfE5wwQGC6OMBdO9n6fA_iJkZWyoc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
