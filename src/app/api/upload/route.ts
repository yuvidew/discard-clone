import { auth } from "@clerk/nextjs/server";
import { badRequest, errorResponse, successResponse, unauthorized } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { BUCKET_ID, getFileUrl, storage } from "@/lib/appwrite";

// Largest accepted image, in bytes (4 MB).
const MAX_SIZE = 4 * 1024 * 1024;

// Uploads an image to Appwrite Storage and returns its public URL.
export const POST = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return badRequest("No file provided");
    if (!file.type.startsWith("image/")) return badRequest("File must be an image");
    if (file.size > MAX_SIZE) return badRequest("Image must be 4 MB or smaller");

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await storage.createFile({
      bucketId: BUCKET_ID,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(buffer, file.name),
      // Anyone can view the image (avatars/server icons); only the server API key can modify it.
      permissions: [Permission.read(Role.any())],
    });

    return successResponse({ fileId: uploaded.$id, url: getFileUrl(uploaded.$id) });
  } catch {
    return errorResponse("Upload failed");
  }
};
