"use client"
import { useGetChannels } from '@/features/channels/hook/use-get-channels';
import { useParams } from 'next/navigation';
import { HashIcon, MicIcon, VideoIcon, type LucideIcon } from "lucide-react";
import { ServerHeader } from './server-header';
import { ServerSearch } from './server-search';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { ChannelType } from '@/features/channels/types/type';
import { CreateChannelButton } from './create-channel-button';
import { ChannelItem } from './channel-item';
import { MemberList } from './member-list';

// Display order, heading and icon for each channel type; each type is rendered as its own section.
const SECTIONS: { type: ChannelType; label: string; icon: LucideIcon }[] = [
  { type: "TEXT", label: "Text channels", icon: HashIcon },
  { type: "AUDIO", label: "Voice channels", icon: MicIcon },
  { type: "VIDEO", label: "Video channels", icon: VideoIcon },
];

export const ServerSidebar = () => {
  // useParams is nullable when a Pages Router folder exists, so read each key defensively.
  const params = useParams<{ id: string; channelId?: string; memberId?: string }>();
  const id = params?.id ?? "";
  const channelId = params?.channelId;
  const memberId = params?.memberId;

  const { data, isPending, isError } = useGetChannels(id);

  // Guests can't add channels; the channels API enforces this too.
  const canCreateChannel = data?.role !== "GUEST";
  return (
    <div className="flex h-full w-full flex-col gap-y-1  dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader serverId={id} />
      <ServerSearch serverId={id} />
      <Separator/>

      <ScrollArea className="min-h-0 flex-1">
        <div className='flex flex-col gap-4 p-2'>
          {isPending &&
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-7 w-full" />)}

          {isError && <p className="px-2 text-sm text-destructive">Couldn&apos;t load channels.</p>}

          {data &&
            SECTIONS.map(({ type, label, icon: Icon }) => {
              const channels = data.channels.filter((channel) => channel.type === type);
              // Sections with no channels are hidden entirely.
              if (channels.length === 0) return null;

              return (
                <section key={type} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between ">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">{label}</h3>
                    {canCreateChannel && <CreateChannelButton serverId={id} type={type} />}
                  </div>
                  {channels.map((channel) => (
                    <ChannelItem key={channel.id} serverId={id} channelId={channelId!} channel={channel} icon={Icon} canEdit={canCreateChannel} />
                  ))}
                </section>
              );
            })}

          <MemberList serverId={id} memberId={memberId!} />
        </div>
      </ScrollArea>
    </div>
  )
}
