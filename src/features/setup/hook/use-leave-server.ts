import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveServer } from "../api";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";

// Leaves a server, then refreshes the sidebar server list.
export const useLeaveServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: leaveServer,
        mutationKey: ["leave-server"],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-servers"] });
            toast.add({ title: "You left the server", type: "success" });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't leave server",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}