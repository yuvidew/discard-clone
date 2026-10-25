import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { deleteMessage } from "../api/messages";

// Soft-deletes a message, then refreshes that chat's messages (the key rides along in the variables).
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    mutationKey: ["delete-message"],
    onSuccess: (_data, { queryKey }) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.add({ title: "Message deleted", type: "success" });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't delete message",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
