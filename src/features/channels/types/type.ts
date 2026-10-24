import { z } from "zod";

export type MemberRole = "ADMIN" | "MODERATOR" | "GUEST";

export type ChannelType = "TEXT" | "AUDIO" | "VIDEO";

// A channel as listed in the server sidebar.
export type ChannelSummary = { id: string; name: string; type: ChannelType };

// Shape of the GET /api/servers/[id]/channels success response.
export type GetChannelsResponse = {
  server: { id: string; name: string; imageUrl: string };
  // The signed-in user's role in this server.
  role: MemberRole;
  channels: ChannelSummary[];
};

// Shape of the GET /api/servers/[id]/channels/[channelId] success response.
export type GetChannelByIdResponse = {
  channel: ChannelSummary;
  // The signed-in user's role in this server.
  role: MemberRole;
};

// Validation for the "create channel" form; "general" is reserved for the default channel.
export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Channel name is required.")
    .refine((name) => name.toLowerCase() !== "general", "Channel name cannot be 'general'."),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
});

export type CreateChannelValues = z.infer<typeof createChannelSchema>;

// Variables sent to the create-channel API.
export type CreateChannelPayload = CreateChannelValues & { serverId: string };

// Editing accepts the same fields and rules as creating.
export const updateChannelSchema = createChannelSchema;

// Variables sent to the update-channel API.
export type UpdateChannelPayload = CreateChannelValues & { serverId: string; channelId: string };

// Variables sent to the delete-channel API.
export type DeleteChannelPayload = { serverId: string; channelId: string };
