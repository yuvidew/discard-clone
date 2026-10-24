"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetChannelById } from "../hook/use-get-channel-by-id";
import { ChatHeader } from "./chat-header";

/**
 * @component ChannelView
 * @description Loads the channel named in the URL and renders its header, with loading and error states.
 * @param navigation Server-rendered server rail, forwarded to the header's mobile menu.
 */
export const ChannelView = ({ navigation }: { navigation: ReactNode }) => {
  const { id: serverId, channelId } = useParams<{ id: string; channelId: string }>();
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

  return <ChatHeader name={data.channel.name} type={data.channel.type} navigation={navigation} />;
};
