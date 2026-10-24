import { useQuery } from "@tanstack/react-query";
import { getChannels } from "../api";

// All channels of one server, for the server sidebar.
export const useGetChannels = (serverId: string) => useQuery({
    queryFn: () => getChannels(serverId),
    queryKey: ["get-channels", serverId],
    enabled: Boolean(serverId),
});