import type { NextApiRequest } from "next";

import type { NextApiRespnseServerIo } from "@/features/members/types/type";
import { badRequestPage, errorResponsePage, notFoundPage, unauthorizedPage } from "@/lib/api-response-page";
import { currentProfilePage } from "@/lib/current-profile-page";
import { prisma } from "@/lib/prisma";

// Edits (PATCH) or soft-deletes (DELETE) a channel message, then broadcasts the updated message to connected sockets.
const handler = async (
    req: NextApiRequest,
    res: NextApiRespnseServerIo
) => {
    if (req.method !== "PATCH" && req.method !== "DELETE") {
        res.setHeader("Allow", "PATCH, DELETE");
        return errorResponsePage(res, "Method not allowed", 405);
    }

    try {
        const profile = await currentProfilePage(req);
        const { messageId, serverId, channelId } = req.query;

        if (!profile) {
            return unauthorizedPage(res);
        }

        if (typeof messageId !== "string" || !messageId) {
            return badRequestPage(res, "Message ID missing");
        }

        if (typeof serverId !== "string" || !serverId) {
            return badRequestPage(res, "Server ID missing");
        }

        if (typeof channelId !== "string" || !channelId) {
            return badRequestPage(res, "Channel ID missing");
        }

        // The signed-in user's membership; null when they don't belong to this server.
        const member = await prisma.member.findFirst({
            where: { serverId, profileId: profile.id }
        });

        if (!member) {
            return notFoundPage(res, "Member not found");
        }

        // Scoped to the channel (and through it the server) so ids from elsewhere can't be touched.
        const existing = await prisma.message.findFirst({
            where: {
                id: messageId,
                channelId,
                channel: { serverId }
            }
        });

        if (!existing || existing.deleted) {
            return notFoundPage(res, "Message not found");
        }

        const isOwner = existing.memberId === member.id;
        const canModify = isOwner || member.role === "ADMIN" || member.role === "MODERATOR";

        if (!canModify) {
            return unauthorizedPage(res);
        }

        const include = { member: { include: { profile: true } } };

        let message;

        if (req.method === "DELETE") {
            message = await prisma.message.update({
                where: { id: messageId },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted.",
                    deleted: true
                },
                include
            });
        } else {
            // Only the author may edit, and only text-only messages.
            if (!isOwner) {
                return unauthorizedPage(res);
            }

            if (existing.fileUrl) {
                return badRequestPage(res, "Messages with attachments can't be edited");
            }

            const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";

            if (!content) {
                return badRequestPage(res, "Content missing");
            }

            message = await prisma.message.update({
                where: { id: messageId },
                data: { content },
                include
            });
        }

        // The socket server only exists after /api/socket/io has been hit once.
        res.socket.server.io?.emit(`chat:${channelId}:messages:update`, message);

        return res.status(200).json(message);
    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return errorResponsePage(res, "Internal Error");
    }
}

export default handler;
