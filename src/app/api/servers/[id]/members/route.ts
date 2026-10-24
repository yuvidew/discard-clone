import { errorResponse, notFound } from "@/lib/api-response";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// Lists every member of a server with their profile; any member of the server may view the list.
export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id } = await params;
        const profile = await ensureProfile(userId);

        if (!profile) {
            return notFound("Profile not found");
        };

        const current = await prisma.member.findFirst({ where: { profileId: profile.id, serverId: id } });

        if (!current) {
            return notFound("Server not found");
        };

        const server = await prisma.server.findFirst({ where: { id } });
        if (!server) {
            return notFound("Server not found");
        };

        const rows = await prisma.member.findMany({
            where: { serverId: id},
            include: {
                profile: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        // Only the fields the UI needs.
        const members = rows.map(({ id: memberId, role, profile: p }) => ({
            id: memberId,
            role,
            profile: { id: p.id, name: p.name, email: p.email, imageUrl: p.imageUrl },
        }));

        return NextResponse.json({ members, currentMemberId: current.id, ownerProfileId: server.profileId });
    } catch (error) {
        console.log("Server fetch error: ", error);
        return errorResponse("Couldn't fetch servers");
    }
}