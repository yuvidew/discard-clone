import React, { Fragment } from 'react'
import type { ChannelMember, MessageWithMemberWithProfile } from '../types/type';
import { ChatWelcome } from './chat-welcome';
import { ChatItem } from './chat-item';
import { useChatQuery } from '../hook/use-chat-query';
import { Spinner } from '@/components/ui/spinner';
import { ServerCrashIcon } from 'lucide-react';
import { format } from 'date-fns';

// Timestamp format shown next to the author, e.g. "25 Oct 2026, 14:05".
const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
    name: string;
    member: ChannelMember;
    chatId: string;
    apiUrl: string;
    socketUri: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation"
}

export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUri,
    socketQuery,
    paramKey,
    paramValue,
    type
}: ChatMessagesProps) => {
    const queryKey = `chat:${chatId}`
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue
    });

    if (status === "pending") {
        return (
            <div className='flex flex-col flex-1 gap-y-2 justify-center items-center'>
                <Spinner/>
                <p className='text-xs text-zinc-500 dark:text-zinc-400'>Loading messages...</p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className='flex flex-col flex-1 gap-y-2 justify-center items-center'>
                <ServerCrashIcon/>
                <p className='text-xs text-zinc-500 dark:text-zinc-400'>Somthing went wrong</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
            <div className='flex-1' />

            <ChatWelcome
                type={type}
                name={name}
            />

            <div className='flex flex-col-reverse mt-auto'>
                {data?.pages.map((group, i) => (
                    <Fragment key = {i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={socketUri}
                                socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
        </div>
    )
}
