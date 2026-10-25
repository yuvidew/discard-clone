import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { editMessage } from "../api/messages";

// Edits a message, then refreshes that chat's messages (the key is passed with the variables).
export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editMessage,
    mutationKey: ["edit-message"],
    onSuccess: (_data, { queryKey }) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't edit message",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
