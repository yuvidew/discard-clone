import axios from "axios";

// Shared axios instance; baseURL is "/api" so call paths are "/upload", not "/api/upload".
export const api = axios.create({ baseURL: "/api" });

// Pulls the `{ error }` message our route handlers return, falling back to a generic string for toasts.
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { error?: string } | undefined)?.error;
    if (message) return message;
  }
  return fallback;
};
