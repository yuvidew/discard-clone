import { Member, Message, Profile } from "@/generated/prisma/client";
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

// The signed-in user's membership in the server that owns the channel.
export type ChannelMember = { id: string; role: MemberRole; profileId: string; serverId: string };

// Shape of the GET /api/servers/[id]/channels/[channelId] success response.
export type GetChannelByIdResponse = {
  channel: ChannelSummary;
  // The signed-in user's role in this server.
  role: MemberRole;
  member: ChannelMember;
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


// Where a message edit/delete goes: the socket route plus the ids it needs in the query string.
// queryKey is the chat's TanStack key; it only rides along so the hook can refresh that chat afterwards.
type MessageTarget = { socketUrl: string; messageId: string; socketQuery: Record<string, string>; queryKey: string };

// Variables sent to the edit-message API.
export type EditMessagePayload = MessageTarget & { content: string };

// Variables sent to the delete-message API.
export type DeleteMessagePayload = MessageTarget;

// Validation for the inline edit form.
export const editMessageSchema = z.object({
  content: z.string().trim().min(1, "Message can't be empty."),
});

export type EditMessageValues = z.infer<typeof editMessageSchema>;

export type MessageWithMemberWithProfile =Message & {
  member: Member & {
    profile: Profile
  }
}