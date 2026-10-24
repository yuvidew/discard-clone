import { prisma } from "./prisma";

// Looks up a conversation for the exact member pair (one -> two), returning null on failure.
const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await prisma.conversation.findFirst({
        where: {
            AND: [
                { memberOneId },
                { memberTwoId }
            ]
        },
        include: {
            memberOne: {
                include: {
                    profile: true,
                }
            },
            memberTwo: {
                include: {
                    profile: true,
                }
            }
        }
    });
    } catch {
        return null
    }
};

// Creates a conversation between two members with their profiles included, returning null on failure.
const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await prisma.conversation.create({
            data: {
                memberOneId,
                memberTwoId
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true,
                    }
                }
            }
        })
    } catch {
        return null;
    }
};

// Finds a conversation in either member order, creating one if none exists.
export const getOrCreateConvesation = async (memberOneId: string, memberTwoId: string) =>{
    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);

    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId);
    };

    return conversation;
}