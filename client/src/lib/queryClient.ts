import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// This file is no longer used as we've migrated from React Query to direct Supabase calls
// Keeping it for now to avoid breaking imports, but it's deprecated

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // This function is deprecated and should not be used
  // Use Supabase client directly instead
  throw new Error("apiRequest is deprecated. Use Supabase client directly.");
}

// Create a proper QueryClient instance to avoid breaking imports
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const getQueryFn = () => {
  // Mock function to avoid breaking imports
  return async () => {
    throw new Error("getQueryFn is deprecated. Use Supabase client directly.");
  };
};