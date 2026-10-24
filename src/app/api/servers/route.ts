import { createServerSchema } from "@/features/setup/types/types";
import { uploadImage } from "@/lib/appwrite";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { badRequest, errorResponse, notFound, successResponse, unauthorized } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { ensureProfile } from "@/lib/ensure-profile";

export const POST = async (req: NextRequest) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const formData = await req.formData();
        const parsed = createServerSchema.safeParse({
            name: formData.get("name"),
            image: formData.get("image")
        });

        if (!parsed.success) {
            return badRequest(parsed.error.issues[0].message);
        };

        const profile = await prisma.profile.findUnique({ where: { userId } });

        if (!profile) {
            return notFound("Profile not found");
        };

        const imageUrl = await uploadImage(parsed.data.image);

        const server = await prisma.$transaction(async (tx) => {
            const create = await tx.server.create({
                data: {
                    name: parsed.data.name,
                    imageUrl,
                    inviteCode: crypto.randomUUID(),
                    profileId: profile.id,
                }
            });

            await tx.channel.create({
                data: {
                    name: "general",
                    type: "TEXT",
                    profileId: profile.id,
                    serverId: create.id,
                }
            });

            await tx.member.create({
                data: {
                    role: "ADMIN",
                    profileId: profile.id,
                    serverId: create.id,
                }
            });

            return create;
        });

        // The default channel is the user's landing spot after creating the server.
        const channel = await prisma.channel.findFirst({ where: { serverId: server.id } });

        return successResponse({ server, channelId: channel?.id ?? null }, 201);

    } catch (error) {
        console.log("Server POST error: ", error);
        return errorResponse("Couldn't create server");
    }
};

// Lists every server the signed-in user is a member of (created or joined via invite), in the order they joined.
export const GET = async () => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const profile = await ensureProfile(userId);

        const memberships = await prisma.member.findMany({
            where: {
                profileId: profile.id
            },
            include: {
                server: true
            },
            orderBy: {
                createdAt: "asc"
            },
        });

        const servers = memberships.map(({ server: {id, name, imageUrl}}) => ({
            id, name, imageUrl
        }));

        return successResponse({ servers });
        
    } catch (error) {
        console.log("Server GET error: ", error);
        return errorResponse("Couldn't load servers");
    }
}