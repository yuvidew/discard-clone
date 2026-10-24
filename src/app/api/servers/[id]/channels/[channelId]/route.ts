import { authorizeChannelEdit } from "@/features/channels/helper";
import { updateChannelSchema } from "@/features/channels/types/type";
import { badRequest, errorResponse, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string; channelId: string }> };

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
            data : {
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

        await prisma.channel.delete({where: { id: channelId }});
        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Couldn't delete channel", error);
        return errorResponse("Couldn't delete channel");
    }
}