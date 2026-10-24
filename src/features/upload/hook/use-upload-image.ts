import { useMutation } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { uploadImage } from "../api";

// Uploads an image to Appwrite; callers read the returned `url` via mutate's per-call onSuccess and save it (e.g. as imageUrl).
export const useUploadImage = () =>
  useMutation({
    mutationFn: uploadImage,
    mutationKey: ["upload-image"],
    onError: (error) => {
      toast.add({ title: "Couldn't upload image", description: getErrorMessage(error, "Please try again."), type: "error" });
    },
  });
