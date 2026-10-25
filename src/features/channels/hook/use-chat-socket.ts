import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";
import { MessageWithMemberWithProfile } from "../types/type";

// One page of messages as returned by the messages API.
type MessagesPage = {
    items: MessageWithMemberWithProfile[];
    nextCursor?: string | null;
};

// Shape of the cached infinite query for a chat.
type ChatData = InfiniteData<MessagesPage, string | undefined>;

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
};


export const useChatSocket = ({
    addKey,
    updateKey,
    queryKey
}: ChatSocketProps) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData<ChatData>([queryKey], (oldData) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return oldData;
                }

                const newData = oldData.pages.map((page) => {
                    return {
                        ...page,
                        items: page.items.map((item: MessageWithMemberWithProfile) => {
                            if (item.id === message.id) {
                                return message;
                            }

                            return item;
                        })
                    }
                });

                return {
                    ...oldData,
                    pages: newData
                }
            })
        });

        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData<ChatData>([queryKey], (oldData) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return {
                        pages: [{
                            items: [message],
                        }],
                        pageParams: [undefined]
                    };
                }

                const newData = [...oldData.pages];

                newData[0] = {
                    ...newData[0],
                    items: [
                        message,
                        ...newData[0].items
                    ]
                };

                return {
                    ...oldData,
                    pages: newData
                }
            });
        });

        return () => {
            socket.off(addKey)
            socket.off(updateKey)
        }

    }, [queryClient, addKey, updateKey, socket, queryKey])
}