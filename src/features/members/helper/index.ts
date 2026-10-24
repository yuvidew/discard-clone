import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// Checks the caller is an admin of the server and the target is a modifiable member; returns `{ error }` with the response to send back, or `{ error: null }` when allowed.
export const authorizeAdmin = async (userId: string, serverId: string, memberId: string) => {
  const profile = await prisma.profile.findFirst({ where: {userId} });
  if (!profile) return { error: notFound("Profile not found") };

  const caller = await prisma.member.findFirst({ where: { profileId: profile.id, serverId } });
  if (!caller) return { error: notFound("Server not found") };
  if (caller.role !== "ADMIN") {
    return { error: badRequest("Only admins can manage members") };
  }

  // Scoped to this server so a member id from another server can't be targeted.
  const target = await prisma.member.findFirst({where: { id: memberId, serverId}});
  if (!target) return { error: notFound("Member not found") };

  const server = await prisma.server.findFirst({where: { id: serverId}})
  // Neither yourself nor the server's creator can be changed or removed.
  if (target.id === caller.id || target.profileId === server?.profileId) {
    return { error: badRequest("This member can't be modified") };
  }

  return { error: null };

}