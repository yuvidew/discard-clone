import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateServer } from "../api";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/axios";

// Updates a server's name/image, then refreshes the navigation rail and the server sidebar header.
export const useUpdateServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateServer,
        mutationKey: ["update-server"],
        onSuccess: ({ server }) => {
            queryClient.invalidateQueries({ queryKey: ["get-servers"] });
            queryClient.invalidateQueries({ queryKey: ["get-channels", server.id] });
            toast.add({ title: "Server updated", type: "success" });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't update server",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}