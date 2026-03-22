import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Return null client if env vars are not configured
  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  // Validate URL
  try {
    new URL(supabaseUrl)
  } catch {
    return null
  }

  // Use singleton pattern for browser client
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey)
  }

  return client
}
