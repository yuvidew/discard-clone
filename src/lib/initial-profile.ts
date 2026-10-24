import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// Returns the signed-in user's Profile, creating it from their Clerk data on first visit (redirects to /sign-in if signed out, then back to `returnTo`).
export const initialProfile = async (returnTo?: string) => {
  await requireAuth(returnTo);
  const user = await currentUser();
  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;

  return prisma.profile.create({
    data: {
      userId: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Unnamed",
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress ?? "",
    },
  });
};
