import { api } from "@/lib/axios";
import type { UploadResponse } from "../types";

// Uploads an image as multipart form data and returns its Appwrite file id and public URL.
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<UploadResponse>("/upload", formData);
  return data;
};
