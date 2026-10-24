import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateInviteCode } from "../api";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/axios";

// Generates a new invite code for a server; the previous link stops working.
export const useGenerateInviteCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generateInviteCode,
        mutationKey: ["generate-invite-code"],
        onSuccess: (_data, serverId) => {
            queryClient.invalidateQueries({ queryKey: ["get-channels", serverId] });
        },
        onError: (error) => {
            toast.add({
                title: "Couldn't generate invite link",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        },
    })
}