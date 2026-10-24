import { updateServerSchema } from "@/features/setup/types/types";
import { badRequest, errorResponse, notFound, unauthorized } from "@/lib/api-response";
import { uploadImage } from "@/lib/appwrite";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Renames a server and/or replaces its image; only the server's admins may do this. Omitting the image keeps the current one.
export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };

    try {
        const { id } = await params;

        const formData = await req.formData();
        const image = formData.get("image");
        const parsed = updateServerSchema.safeParse({
            name: formData.get("name"),
            // An absent field arrives as null; treat it as "no new image".
            image: image instanceof File ? image : undefined,
        });

        if (!parsed.success) {
            return badRequest(parsed.error.issues[0].message);
        };

        const profile = await ensureProfile(userId);

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

        // Pick the allowed fields explicitly; the image is only touched when a new file was uploaded.
        const changes: { name: string; imageUrl?: string } = { name: parsed.data.name };
        if (parsed.data.image) changes.imageUrl = await uploadImage(parsed.data.image);

        const server = await prisma.server.update({
            where: { id },
            data: changes,
        });

        if (!server) {
            return notFound("Server not found")
        };

        return NextResponse.json({ server: { id: server.id, name: server.name, imageUrl: server.imageUrl } });

    } catch (error) {
        console.log("Server update error: ", error);
        return errorResponse("Couldn't update servers");
    }
};

// Deletes a server (its channels and members cascade); only the server's admins may do this.
export const DELETE = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
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

        const member = await prisma.member.findFirst({ where: { profileId: profile.id, serverId: id } });

        if (!member) {
            return notFound("Member not found");
        };

        if (member.role === "GUEST") {
            return notFound("Not allowed to create channels");
        };

        await prisma.server.delete({ where: {id}})
        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Server delete error: ", error);
        return errorResponse("Couldn't delete servers");
    }
}