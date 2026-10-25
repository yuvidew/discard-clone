import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

// Cursor-paginated chat messages; polls every second while the socket is down.
export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
}: ChatQueryProps) => {
    const { isConnected } = useSocket();

    // Fetches one page of messages, starting after the cursor when there is one.
    const fetchMessages = async ({ pageParam }: { pageParam: string | undefined }) => {
        const params = new URLSearchParams({ [paramKey]: paramValue });
        if (pageParam) params.set("cursor", pageParam);

        const res = await fetch(`${apiUrl}?${params.toString()}`);

        return res.json();
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor as string | undefined,
        refetchInterval: 1000
    });

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    };
};
