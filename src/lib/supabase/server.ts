function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export async function createServiceSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY")
  );
}
