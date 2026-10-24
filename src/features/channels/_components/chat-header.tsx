"use client";

import { AtSignIcon, HashIcon, MicIcon, VideoIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { MobileToggle } from "@/components/mobile-toggle";
import type { ChannelType } from "../types/type";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Icon shown in front of the channel name for each channel type.
const TYPE_ICONS: Record<ChannelType, LucideIcon> = {
  TEXT: HashIcon,
  AUDIO: MicIcon,
  VIDEO: VideoIcon,
};

interface ChatHeaderProps {
  name: string;
  // Omitted for direct-message headers, which show an @ instead of a channel icon.
  type?: ChannelType;
  navigation: ReactNode;
  imageUrl?: string;
}

/**
 * @component ChatHeader
 * @description Top bar of a chat page: a menu button (below md) that opens the sidebars, plus an icon and the channel or member name.
 * @param type Channel type; picks the icon next to the name. Leave out for a member conversation.
 * @param navigation Server-rendered server rail, forwarded to the mobile menu.
 */
export const ChatHeader = ({ name, type, navigation, imageUrl }: ChatHeaderProps) => {
  const Icon = type ? TYPE_ICONS[type] : AtSignIcon;

  return (
    <header className="flex h-12 items-center gap-2 border-b-2 border-neutral-200 px-3 dark:border-neutral-800">
      <MobileToggle navigation={navigation} />
      <Icon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      <Avatar className="size-6">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="text-[10px]">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <h1 className="truncate text-base font-semibold text-black dark:text-white">{name}</h1>
    </header>
  );
};
