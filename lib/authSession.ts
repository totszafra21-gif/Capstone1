/**
 * Auth Session Manager
 * Handles session refresh, token validation, and graceful error recovery
 */

import { supabase } from "./supabase";
import { User, Session } from "@supabase/supabase-js";

/**
 * Check if session is valid and refresh if needed
 */
export async function validateSession(): Promise<Session | null> {
  try {
    // Supabase session storage exists only in the browser. On the server there is
    // no localStorage/cookie-backed session unless you wire it explicitly.
    if (typeof window === "undefined") return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return null;
    }
    
    if (session) {
      return session;
    }

    // If there's no session in storage, do not call refreshSession().
    // Calling refresh without a refresh token triggers `Invalid Refresh Token`.
    return null;
  } catch {
    // Suppress auth errors - they're handled gracefully
    return null;
  }
}

/**
 * Get current user with session validation
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const session = await validateSession();
  return session?.user ?? null;
}

/**
 * Handle auth errors gracefully
 * Returns true if handled (logged out), false if re-authentication needed
 */
export function handleAuthError(error: unknown): { shouldLogout: boolean; message: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for specific error types
  if (errorMessage.includes("Invalid Refresh Token") || 
      errorMessage.includes("Refresh Token Not Found") ||
      errorMessage.includes("Token expired") ||
      errorMessage.includes("invalid_token")) {
    return {
      shouldLogout: true,
      message: "Your session has expired. Please log in again."
    };
  }
  
  if (errorMessage.includes("JWT") || errorMessage.includes("jwt")) {
    return {
      shouldLogout: true,
      message: "Authentication error. Please log in again."
    };
  }
  
  // Network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return {
      shouldLogout: false,
      message: "Network error. Please check your connection."
    };
  }
  
  // Default: don't force logout
  return {
    shouldLogout: false,
    message: "An error occurred. Please try again."
  };
}

/**
 * Sign out and clear all session data
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}

/**
 * Check if user is authenticated (client-side helper)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  
  const sessionData = localStorage.getItem("sb-vaxszpsdzbdmzzfixfzk-auth-token");
  if (!sessionData) return false;
  
  try {
    const parsed = JSON.parse(sessionData);
    return !!parsed?.access_token;
  } catch {
    return false;
  }
}

/**
 * Get auth token from storage
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}
