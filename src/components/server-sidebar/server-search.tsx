"use client";

import {
  HashIcon,
  MicIcon,
  SearchIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetChannels } from "@/features/channels/hook/use-get-channels";
import type { ChannelType } from "@/features/channels/types/type";
import { useGetMembers } from "@/features/members/hook/use-get-members";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { MemberRoleIcon } from "./member-role-icon";

// Group heading and icon for each channel type, in display order.
const CHANNEL_GROUPS: { type: ChannelType; label: string; icon: LucideIcon }[] =
  [
    { type: "TEXT", label: "Text Channels", icon: HashIcon },
    { type: "AUDIO", label: "Voice Channels", icon: MicIcon },
    { type: "VIDEO", label: "Video Channels", icon: VideoIcon },
  ];

/**
 * @component ServerSearch
 * @description Search button for the server sidebar; opens a command palette (also via Cmd/Ctrl+K) to jump to a channel or find a member of the current server.
 * @param serverId Id of the server whose channels and members are searched.
 */
export const ServerSearch = ({ serverId }: { serverId: string }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Members are fetched lazily, only once the palette is first opened.
  const { data: channelData } = useGetChannels(serverId);
  const { data: memberData } = useGetMembers(serverId, open);

  // Toggles the palette on Cmd+K (macOS) / Ctrl+K (Windows, Linux).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Closes the palette and navigates to the picked channel.
  const goToChannel = (channelId: string) => {
    setOpen(false);
    router.push(`/server/${serverId}/channels/${channelId}`);
  };

  // Server members in creation order; empty until the palette has been opened.
  const members = memberData?.members ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mx-2 mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground "
      >
        <SearchIcon className="size-4 shrink-0" />
        <span>Search</span>
        <Kbd className="ml-auto">Ctrl K</Kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search all channels and members"
      >
        {/* cmdk context provider; CommandDialog does not add one in this shadcn version. */}
        <Command>
          <CommandInput placeholder="Search all channels and members" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {CHANNEL_GROUPS.map(({ type, label, icon: Icon }) => {
              const channels =
                channelData?.channels.filter(
                  (channel) => channel.type === type,
                ) ?? [];
              if (channels.length === 0) return null;

              return (
                <CommandGroup key={type} heading={label}>
                  {channels.map((channel) => (
                    <CommandItem
                      key={channel.id}
                      value={`${channel.name} ${channel.id}`}
                      onSelect={() => goToChannel(channel.id)}
                    >
                      <Icon />
                      <span>{channel.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}

            {members.length > 0 && (
              <CommandGroup heading="Members">
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${member.profile.name} ${member.id}`}
                    onSelect={() => setOpen(false)}
                  >
                    <MemberRoleIcon role={member.role} />
                    <span>{member.profile.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
