import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createChannel } from "../api";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/axios";

// Creates a channel, then refreshes that server's channel list.
export const useCreateChannel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createChannel,
        mutationKey: ["create-channel"],
        onSuccess: (_data, { serverId }) => {
            queryClient.invalidateQueries({ queryKey: ["get-channels", serverId] });
            toast.add({ title: "Channel created", type: "success" });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't create channel",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}