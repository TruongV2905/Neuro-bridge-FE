import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env variables")
}

console.log("SUPABASE CLIENT URL:", supabaseUrl)
console.log("SUPABASE CLIENT KEY:", supabaseAnonKey.slice(0, 20))

export const supabase = createClient(supabaseUrl, supabaseAnonKey)