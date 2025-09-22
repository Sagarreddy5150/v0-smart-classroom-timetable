import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ixqjqjqjqjqjqjqjqjqj.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MzI2NzAsImV4cCI6MjA0ODIwODY3MH0.placeholder"

  console.log("[v0] Client Environment Check:", {
    url: supabaseUrl ? "✓ Found" : "✗ Missing",
    key: supabaseAnonKey ? "✓ Found" : "✗ Missing",
    allSupabaseEnvs: Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Please check your project settings.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
