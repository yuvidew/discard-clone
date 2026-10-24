import { Client, ID, Permission, Role, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

// Server-only Appwrite client authenticated with the API key (never import this from a client component).
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

// Storage service used for image uploads.
export const storage = new Storage(client);

// Bucket that holds uploaded images.
export const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

// Builds the public URL of a stored file; the file must grant read access to Role.any().
export const getFileUrl = (fileId: string) =>
  `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.APPWRITE_PROJECT_ID}`;


// Uploads an image to the Appwrite bucket (publicly readable) and returns its public view URL.
export const uploadImage = async (file: File) => {
  const bucketId = process.env.APPWRITE_BUCKET_ID!;

  const uploaded = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file: InputFile.fromBuffer(Buffer.from(await file.arrayBuffer()), file.name),
    permissions: [Permission.read(Role.any())],
  });

  return getFileUrl(uploaded.$id);
}