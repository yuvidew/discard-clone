import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { updateChannel } from "../api";

// Updates a channel, then refreshes that server's channel list.
export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateChannel,
    mutationKey: ["update-channel"],
    onSuccess: (_data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ["get-channels", serverId] });
      // Prefix match: also refreshes the open channel's header.
      queryClient.invalidateQueries({ queryKey: ["get-channel-by-id", serverId] });
      toast.add({ title: "Channel updated", type: "success" });
    },
    onError: (error) => {
      toast.add({
        title: "Couldn't update channel",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    },
  });
};
