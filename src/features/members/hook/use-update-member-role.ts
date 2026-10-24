import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { updateMemberRole } from "../api";

// Changes a member's role, then refreshes the members list.
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMemberRole,
    mutationKey: ["update-member-role"],
    onSuccess: (_data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ["get-members", serverId] });
      toast.add({ title: "Role updated", type: "success" });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't update role",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
