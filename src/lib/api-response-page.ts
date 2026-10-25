import type { NextApiResponse } from "next";

// Pages Router twin of api-response.ts: those helpers return NextResponse, which pages/api routes can't send.

// Sends the `{ error }` JSON failure response that the client's getErrorMessage reads.
export const errorResponsePage = (res: NextApiResponse, message: string, status = 500) =>
  res.status(status).json({ error: message });

// Shortcuts for the common failure statuses.
export const unauthorizedPage = (res: NextApiResponse) => errorResponsePage(res, "Unauthorized", 401);
export const badRequestPage = (res: NextApiResponse, message: string) => errorResponsePage(res, message, 400);
export const notFoundPage = (res: NextApiResponse, message: string) => errorResponsePage(res, message, 404);
