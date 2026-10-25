import { Message } from "@/generated/prisma/client";
import { errorResponse, notFound, unauthorized } from "@/lib/api-response";
import { currentProfilePage } from "@/lib/current-profile-page";
import { ensureProfile } from "@/lib/ensure-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export const GET = async (req: NextRequest) => {
    const { userId } = await auth();

    if (!userId) {
        return unauthorized();
    };
    try {

        const profile = await ensureProfile(userId);

        if (!profile) {
            return unauthorized();
        }

        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");

        if (!channelId) {
            return notFound("missing");
        };

        let messages: Message[] = [];

        if (cursor) {
            messages = await prisma.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor
                },
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });
        } else{
            messages = await prisma.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });
        }


        let nextCursor = null;
        
        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        })
    } catch (error) {
        console.log("[MESSAGES_GET]", error);

        return errorResponse("Internal server error")
    }
}