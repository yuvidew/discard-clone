import { useQuery } from "@tanstack/react-query";
import { getServers } from "../api";

// Servers created by the signed-in user, for the navigation sidebar.
export const useGetServers = () => useQuery({
    queryFn: getServers,
    queryKey: ["get-servers"]
})