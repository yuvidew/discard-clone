"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetChannelById } from "../hook/use-get-channel-by-id";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

/**
 * @component ChannelView
 * @description Loads the channel named in the URL and renders its header, with loading and error states.
 * @param navigation Server-rendered server rail, forwarded to the header's mobile menu.
 */
export const ChannelView = ({ navigation }: { navigation: ReactNode }) => {
  // useParams is nullable when a Pages Router folder exists; empty ids keep the query disabled.
  const params = useParams<{ id: string; channelId: string }>();
  const serverId = params?.id ?? "";
  const channelId = params?.channelId ?? "";
  const { data, isPending, isError } = useGetChannelById(serverId, channelId);

  if (isPending) {
    return (
      <div className="flex h-12 items-center gap-2 border-b-2 border-neutral-200 px-3 dark:border-neutral-800">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-sm text-destructive">Couldn&apos;t load this channel.</p>;
  }

  return (
    // h-dvh, not h-full: the root <body> only sets min-height, so percentage heights don't resolve.
    <div className='bg-white dark:bg-[#313338] flex flex-col h-dvh'>
      <ChatHeader name={data.channel.name} type={data.channel.type} navigation={navigation} />

      <ChatMessages
        member={data.member}
        name={data.channel.name}
        chatId={data.channel.id}
        type="channel"
        apiUrl="/api/messages"
        socketUri="/api/socket/messages"
        socketQuery={{
          channelId: data.channel.id,
          // The channel payload has no serverId; the one from the URL is the same server.
          serverId,
        }}
        paramKey='channelId'
        paramValue={data.channel.id}
      />

      <ChatInput 
        name={data.channel.name}
        type="channel"
        apiUrl="/api/socket/messages"
        query={{
          channelId: data.channel.id,
          // The channel payload has no serverId; the one from the URL is the same server.
          serverId,
        }}
        placeholder={`Message #${data.channel.name}`} 
      />
    </div>
  );
};
