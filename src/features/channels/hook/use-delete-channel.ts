import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { deleteChannel } from "../api";

// Deletes a channel, then refreshes that server's channel list.
export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChannel,
    mutationKey: ["delete-channel"],
    onSuccess: (_data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ["get-channels", serverId] });
      toast.add({ title: "Channel deleted", type: "success" });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't delete channel",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
