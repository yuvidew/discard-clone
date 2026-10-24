import { useQuery } from "@tanstack/react-query";
import { getChannelById } from "../api";

// One channel of a server, for the channel page header.
export const useGetChannelById = (serverId: string, channelId: string) => useQuery({
    queryFn: () => getChannelById(serverId, channelId),
    queryKey: ["get-channel-by-id", serverId, channelId],
    enabled: Boolean(serverId) && Boolean(channelId),
});
