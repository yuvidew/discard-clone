"use client";

import { HashIcon, MicIcon, VideoIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { MobileToggle } from "@/components/mobile-toggle";
import type { ChannelType } from "../types/type";

// Icon shown in front of the channel name for each channel type.
const TYPE_ICONS: Record<ChannelType, LucideIcon> = {
  TEXT: HashIcon,
  AUDIO: MicIcon,
  VIDEO: VideoIcon,
};

interface ChatHeaderProps {
  name: string;
  type: ChannelType;
  navigation: ReactNode;
}

/**
 * @component ChatHeader
 * @description Top bar of a channel page: a menu button (below md) that opens the sidebars, plus the channel's type icon and name.
 * @param type Channel type; picks the icon next to the name.
 * @param navigation Server-rendered server rail, forwarded to the mobile menu.
 */
export const ChatHeader = ({ name, type, navigation }: ChatHeaderProps) => {
  const Icon = TYPE_ICONS[type];

  return (
    <header className="flex h-12 items-center gap-2 border-b-2 border-neutral-200 px-3 dark:border-neutral-800">
      <MobileToggle navigation={navigation} />
      <Icon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      <h1 className="truncate text-base font-semibold text-black dark:text-white">{name}</h1>
    </header>
  );
};
