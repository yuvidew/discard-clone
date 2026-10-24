import { useQuery } from "@tanstack/react-query";

import { getMembers } from "../api";

// All members of one server; pass `enabled` to fetch only while the members dialog is open.
export const useGetMembers = (serverId: string, enabled = true) =>
  useQuery({
    queryFn: () => getMembers(serverId),
    queryKey: ["get-members", serverId],
    enabled: Boolean(serverId) && enabled,
  });
