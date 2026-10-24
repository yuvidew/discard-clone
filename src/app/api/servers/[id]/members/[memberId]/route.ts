import { authorizeAdmin } from "@/features/members/helper";
import { updateMemberRoleSchema } from "@/features/members/types/type";
import { badRequest, errorResponse, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

// Changes a member's role to MODERATOR or GUEST; admins only.
export const PATCH = async (req: NextResponse, { params }: RouteContext) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const {id, memberId} = await params;

        const parsed = updateMemberRoleSchema.safeParse(await req.json());

        if (!parsed.success) {
            return badRequest(parsed.error.issues[0].message);
        };

        const { error } = await authorizeAdmin(userId, id, memberId);

        if(error) return error;

        await prisma.member.update({
            where: { id: memberId},
            data : {
                role: parsed.data.role
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.log("Server fetch error: ", error);
        return errorResponse("Couldn't fetch servers");
    }
};

// Removes a member from the server; admins only.
export const DELETE = async (_req: NextRequest, { params }: RouteContext) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id, memberId } = await params;

        const { error } = await authorizeAdmin(userId, id, memberId);

        if(error) return error;

        await prisma.member.delete({ where: {id: memberId} });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.log("Server fetch error: ", error);
        return errorResponse("Couldn't fetch servers");
    }
}