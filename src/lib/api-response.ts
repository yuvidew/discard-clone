import { NextResponse } from "next/server";

// Builds a JSON success response; defaults to 200 (pass 201 for created resources).
export const successResponse = <T>(body: T, status = 200) => NextResponse.json(body, { status });

// Builds the `{ error }` JSON failure response that the client's getErrorMessage reads.
export const errorResponse = (message: string, status = 500) => NextResponse.json({ error: message }, { status });

// Shortcuts for the common failure statuses.
export const unauthorized = () => errorResponse("Unauthorized", 401);
export const badRequest = (message: string) => errorResponse(message, 400);
export const notFound = (message: string) => errorResponse(message, 404);
