import axios from "axios";

// Pulls the server's `{ error }` message out of a failed request, falling back to a generic string.
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) return error.response?.data?.error ?? fallback;
  return error instanceof Error ? error.message : fallback;
};
