import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.");
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
export const supabaseStorageKey = `sb-${projectRef}-auth-token`;

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    getItem(key: string) {
      const value = window.localStorage.getItem(key);
      if (!value) return null;

      try {
        const parsed = JSON.parse(value);
        if (!parsed?.refresh_token || !parsed?.access_token) {
          window.localStorage.removeItem(key);
          return null;
        }
      } catch {
        window.localStorage.removeItem(key);
        return null;
      }

      return value;
    },
    setItem(key: string, value: string) {
      window.localStorage.setItem(key, value);
    },
    removeItem(key: string) {
      window.localStorage.removeItem(key);
    },
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: supabaseStorageKey,
    storage: getBrowserStorage(),
  },
});
