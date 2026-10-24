import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteServer } from "../api";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/get-error-message";

// Deletes a server, then refreshes the sidebar server list.
export const useDeleteServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteServer,
        mutationKey: ["delete-server"],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-servers"] });
            toast.add({ title: "Server deleted", type: "success" });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't delete server",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}