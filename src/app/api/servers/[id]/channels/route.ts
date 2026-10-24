import { createChannelSchema } from "@/features/channels/types/type";
import { badRequest, errorResponse, notFound } from "@/lib/api-response";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";


// Lists every channel of a server, only if the signed-in user is a member of it.
export const GET = async (_req: NextResponse, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id } = await params;
        const profile = await ensureProfile(userId);
        
        if (!profile) {
            return notFound("Member not found");
        };
        const member = await prisma.member.findFirst({ where: { profileId: profile.id, serverId: id } });

        if (!member) {
            return notFound("Member not found");
        };


        const server = await prisma.server.findFirst({ where: { id } });

        if (!server) {
            return notFound("Server not found")
        };

        const rows = await prisma.channel.findMany({
            where: {
                serverId: id
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        const channels = rows.map(({ id, name, type }) => ({ id, name, type }));
        return NextResponse.json({
            server: { id: server.id, name: server.name, imageUrl: server.imageUrl }, role: member?.role,
            channels
        });

    } catch (error) {
        console.log("Channel featch error: ", error);
        return errorResponse("Couldn't featch channel");
    }
};

// Creates a channel in a server; only admins and moderators may do this.
export const POST = async (req: NextResponse, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id } = await params;

        const parsed = createChannelSchema.safeParse(await req.json());

        if (!parsed.success) {
            return badRequest(parsed.error.issues[0].message);
        };

        const profile = await prisma.profile.findFirst({
            where: {
                userId
            },
        });

        if (!profile) {
            return notFound("Profile not found");
        };


        const member = await prisma.member.findFirst({ where: { profileId: profile.id, serverId: id } });

        if (!member) {
            return notFound("Member not found");
        };

        if (member.role === "GUEST") {
            return notFound("Not allowed to create channels");
        };

        const channel = await prisma.channel.create({
            data: {
                name: parsed.data.name,
                type: parsed.data.type,
                profileId: profile.id,
                serverId: id,
            }
        });

        return NextResponse.json({ channel: { id: channel.id, name: channel.name, type: channel.type } }, { status: 201 });

    } catch (error) {
        console.log("Channel create error: ", error);
        return errorResponse("Couldn't create channel");
    }
}