import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return cachedClient;
}
