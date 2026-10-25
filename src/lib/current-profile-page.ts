import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "./prisma";
import { NextApiRequest } from "next";


// Resolves the signed-in user's Profile inside a Pages Router API route, or null when signed out.
export const currentProfilePage = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId
    }
  });

  return profile;
}