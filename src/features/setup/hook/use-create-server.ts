import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createServer } from "../api";

// Creates a server, refreshes the sidebar server list and toasts the outcome.
export const useCreateServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createServer,
        mutationKey: ["create-server"],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-servers"] });
            toast.add({ title: "Server created", type: "success" });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't create server",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}