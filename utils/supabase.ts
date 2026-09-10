import { createClient } from '@supabase/supabase-js'

// @ts-ignore
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// @ts-ignore
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)