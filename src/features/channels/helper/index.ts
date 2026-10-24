import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// Checks the caller is an admin/moderator of the server and the channel is editable; returns the error response to send back otherwise.
export const authorizeChannelEdit = async (userId: string, serverId: string, channelId: string) => {
    const profile = await prisma.profile.findFirst({ where: { userId } });
    if (!profile) return { error: notFound("Profile not found") };

    const member = await prisma.member.findFirst({ where: { profileId: profile.id, serverId } });
    if (!member) return { error: notFound("Server not found") };
    if (member.role === "GUEST") {
        return { error: badRequest("Not allowed to manage channels") };
    }

    // Scoped to this server so a channel id from another server can't be targeted.
    const channel = await prisma.channel.findFirst({ where: { id: channelId, serverId } });
    if (!channel) return { error: notFound("Channel not found") };

    // "general" is the default channel and is locked.
    if (channel.name === "general") {
        return { error: notFound("The general channel can't be changed") };
    }

    return { error: null };

}