import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { kickMember } from "../api";

// Removes a member from the server, then refreshes the members list; `memberName` rides in the variables only for the toast.
export const useKickMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kickMember,
    mutationKey: ["kick-member"],
    onSuccess: (_data, { serverId, memberName }) => {
      queryClient.invalidateQueries({ queryKey: ["get-members", serverId] });
      toast.add({ title: `${memberName} was removed`, type: "success" });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't remove member",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
