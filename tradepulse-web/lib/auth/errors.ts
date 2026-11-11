import { ApiError } from "@/lib/api/types";

export function mapAuthError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Invalid credentials";
    }
    if (error.status === 409) {
      return "Username taken";
    }
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
