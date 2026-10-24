import { initialProfile } from "@/lib/initial-profile";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * @component InviteGate
 * @description Request-time part of the invite page: resolves the code to a server, adds the signed-in user as a GUEST member if they aren't one yet, then opens the server.
 */
export const InviteGate = async ({ params }: { params: Promise<{ code: string }> }) => {
    const { code } = await params;
    // Signed-out visitors sign in/up first, then Clerk sends them back to this invite link to finish joining.
    const profile = await initialProfile(`/invite/${code}`);

    // No profile means the Clerk user couldn't be resolved; an undefined profileId would also make the member lookup match anyone.
    if (!profile) redirect("/sign-in");

    const server = await prisma.server.findFirst({
        where: {
            inviteCode: code
        }
    });

    // Unknown or regenerated code -> nothing to join.
  if (!server) redirect("/");

  const existing = await prisma.member.findFirst({
    where: {
        profileId: profile.id,
        serverId: server.id
    }
  });

  if (!existing) {
    try {
        await prisma.member.create({
            data: {
                role: "GUEST",
                profileId: profile.id,
                serverId: server.id
            }
        })
    } catch (error) {
        // A concurrent visit may have inserted the row first (unique profileId+serverId); only rethrow if the membership still doesn't exist.

        const joined = await prisma.member.findFirst({
            where: {
                profileId: profile.id,
                serverId: server.id
            }
        });

        if(!joined) throw error;
    }
  };

  redirect(`/server/${server.id}`);
}