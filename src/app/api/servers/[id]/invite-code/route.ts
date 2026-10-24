import { errorResponse, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Generates a fresh invite code for a server (invalidating the old link); only admins and moderators may do this.
export const POST = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {

        const {id} = await params;

        const profile = await prisma.profile.findFirst({
            where: {
                userId
            }
        });

        const member = await prisma.member.findFirst({
            where: {
                profileId: profile?.id,
                serverId: id
            }
        });

        if(!member) return notFound("Server not found");

        if (member.role === "GUEST") {
            return notFound("Not allowed to invite people");
        };

        const server = await prisma.server.update({
            where: {
                id: id
            },
            data: {
                inviteCode: crypto.randomUUID()
            }
        });

        if(!server) return notFound("Server not found");

        return NextResponse.json({
            inviteCode: server.inviteCode
        })

    } catch (error) {
        console.log("Couldn't generate invite link", error);
        return errorResponse("Couldn't generate invite link");
    }
}