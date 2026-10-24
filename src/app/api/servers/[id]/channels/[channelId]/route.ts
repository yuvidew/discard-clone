import { authorizeChannelEdit } from "@/features/channels/helper";
import { updateChannelSchema } from "@/features/channels/types/type";
import { badRequest, errorResponse, notFound, unauthorized } from "@/lib/api-response";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string; channelId: string }> };

// Returns one channel; only members of the owning server may read it.
export const GET = async (_req: NextRequest, { params }: RouteContext) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id, channelId } = await params;
        const profile = await ensureProfile(userId);

        if (!profile) {
            return notFound("Profile not found");
        };

        // Membership gate: non-members get 404 so server ids can't be probed.
        const member = await prisma.member.findFirst({
            where: { profileId: profile.id, serverId: id },
            select: { role: true },
        });

        if (!member) {
            return notFound("Server not found");
        };

        // Scoped to this server so a channel id from another server can't be read.
        const channel = await prisma.channel.findFirst({
            where: { id: channelId, serverId: id },
            select: { id: true, name: true, type: true },
        });

        if (!channel) {
            return notFound("Channel not found");
        };

        return NextResponse.json({ channel, role: member.role });
    } catch (error) {
        console.log("Couldn't fetch channel by id", error);
        return errorResponse("Couldn't fetch channel");
    }
}

// Renames a channel and/or changes its type; admins and moderators only, and never the default "general" channel.
export const PATCH = async (req: NextRequest, { params }: RouteContext) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id, channelId } = await params;

        const parsed = updateChannelSchema.safeParse(await req.json());

        if (!parsed.success) {
            return badRequest(parsed.error.issues[0].message);
        };

        const { error } = await authorizeChannelEdit(userId, id, channelId);


        if (error) return error;

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                name: parsed.data.name,
                type: parsed.data.type
            }
        });

        return NextResponse.json({ channel: { id: channelId, name: parsed.data.name, type: parsed.data.type } });
    } catch (error) {
        console.log("Couldn't update channel", error);
        return errorResponse("Couldn't update channel");
    }
};


// Deletes a channel; admins and moderators only, and never the default "general" channel.
export const DELETE = async (_req: NextRequest, { params }: RouteContext) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id, channelId } = await params;

        const { error } = await authorizeChannelEdit(userId, id, channelId);

        if (error) return error;

        await prisma.channel.delete({ where: { id: channelId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Couldn't delete channel", error);
        return errorResponse("Couldn't delete channel");
    }
}