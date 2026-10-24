import { ensureProfile } from "./ensure-profile";
import { prisma } from "./prisma";

// Returns the signed-in user's member row in a server, or null if they haven't joined it.
export const getCurrentMember = async (userId: string, serverId: string) => {
  const profile = await ensureProfile(userId);

  return prisma.member.findUnique({
    where: { profileId_serverId: { profileId: profile.id, serverId } },
  });
};
