import type { NextApiRequest } from "next";

import type { NextApiRespnseServerIo } from "@/features/members/types/type";
import { BUCKET_ID } from "@/lib/appwrite";
import { currentProfilePage } from "@/lib/current-profile-page";
import { prisma } from "@/lib/prisma";

// Every file URL produced by /api/upload starts with this.
const FILE_URL_PREFIX = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/`;

// Creates a channel message for the signed-in member, then broadcasts it to connected sockets.
const handler = async (
    req: NextApiRequest,
    res: NextApiRespnseServerIo
) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const profile = await currentProfilePage(req);
        const { content, fileUrl } = req.body ?? {};
        const { serverId, channelId } = req.query;

        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (typeof serverId !== "string" || !serverId) {
            return res.status(400).json({ error: "Server ID missing" });
        }

        if (typeof channelId !== "string" || !channelId) {
            return res.status(400).json({ error: "Channel ID missing" });
        }

        // A message needs text, an image, or both.
        const text = typeof content === "string" ? content.trim() : "";
        const imageUrl = typeof fileUrl === "string" && fileUrl ? fileUrl : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ error: "Content missing" });
        }

        // Only images uploaded to our own Appwrite bucket are accepted.
        if (imageUrl && !imageUrl.startsWith(FILE_URL_PREFIX)) {
            return res.status(400).json({ error: "Invalid file URL" });
        }

        // Only servers the signed-in user belongs to are visible here.
        const server = await prisma.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        });

        if (!server) {
            return res.status(404).json({ error: "Server not found" });
        }

        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId,
                serverId
            }
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        const member = server.members.find((member) => member.profileId === profile.id);

        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        const message = await prisma.message.create({
            data: {
                content: text,
                fileUrl: imageUrl,
                channelId,
                memberId: member.id
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        const channelKey = `chat:${channelId}:message`;

        // The socket server only exists after /api/socket/io has been hit once.
        res.socket.server.io?.emit(channelKey, message);

        return res.status(200).json(message);
    } catch (error) {
        console.log("[MESSAGES_POST]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}

export default handler;
