import { z } from "zod";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Shared field rules for the server form (create and edit).
const serverNameSchema = z.string().trim().min(1, "Server name is required.");
const serverImageFileSchema = z
  .instanceof(File, { message: "Server image is required." })
  .refine((file) => file.type.startsWith("image/"), "File must be an image.")
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be 5MB or smaller.");

// Validation for the "create server" form: a name and an image file picked by the user.
export const createServerSchema = z.object({
  name: serverNameSchema,
  image: serverImageFileSchema,
});

// Validation for the "edit server" form: the image is optional, so leaving it empty keeps the current one.
export const updateServerSchema = z.object({
  name: serverNameSchema,
  image: serverImageFileSchema.optional(),
});

export type CreateServerValues = z.infer<typeof createServerSchema>;
export type UpdateServerValues = z.infer<typeof updateServerSchema>;

// Variables sent to the create-server API.
export type CreateServerPayload = CreateServerValues;

// Variables sent to the update-server API; the server id rides along in the variables and is used only for the URL.
export type UpdateServerPayload = UpdateServerValues & { serverId: string };

// Shape of the PATCH /api/servers/[id] success response.
export type UpdateServerResponse = { server: { id: string; name: string; imageUrl: string } };

// Shape of the POST /api/servers success response.
export type CreateServerResponse = {
  server: { id: string; name: string; imageUrl: string; inviteCode: string; profileId: string };
  // The server's default "general" channel, where the user lands after creating it.
  channelId: string | null;
};

// A server as listed in the navigation sidebar.
export type ServerSummary = { id: string; name: string; imageUrl: string };

// Shape of the GET /api/servers success response.
export type GetServersResponse = { servers: ServerSummary[] };
