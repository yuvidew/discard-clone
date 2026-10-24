import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";


// Returns the Profile row for a Clerk user id, creating it from their Clerk info on first visit.
export const ensureProfile = async (userId: string) => {
  const existing = await prisma.profile.findFirst({ where: { userId } });
  if (existing) return existing;

  const user = await currentUser();
  if (!user) throw new Error("Clerk user not found");

  return prisma.profile.create({
    data: {
      userId,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Unknown",
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress ?? "",
    }
  });
};
