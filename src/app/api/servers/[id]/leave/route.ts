import { errorResponse, notFound } from "@/lib/api-response";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";

// Removes the signed-in user's membership; admins can't leave (they must delete the server instead).
export const POST = async (_req: NextResponse, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const {id} = await params;
        const profile = await ensureProfile(userId);

        if (!profile) {
            return notFound("Profile not found");
        };

        const member = await prisma.member.findFirst({ where: { profileId: profile.id, serverId: id } });

        if (!member) {
            return notFound("Member not found");
        };

        if (member.role === "ADMIN") {
            return notFound("Admins can't leave their server");
        };

        await prisma.member.delete({ where: {id: member.id} });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.log("Server leave error: ", error);
        return errorResponse("Couldn't leave servers");
    }
}