"use client";

import { LockIcon, PencilIcon, Trash2Icon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useDeleteChannel } from "@/features/channels/hook/use-delete-channel";
import type { ChannelSummary } from "@/features/channels/types/type";
import { ConfirmServerModal } from "@/components/modals/confirm-server-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ChannelItemProps = {
  serverId: string;
  channelId: string;
  channel: ChannelSummary;
  icon: LucideIcon;
  // Whether the signed-in user may edit channels (admins and moderators).
  canEdit: boolean;
};

/**
 * @component ChannelItem
 * @description One channel row in the sidebar: link to the channel plus, for admins/moderators, edit and delete buttons; the default "general" channel shows a lock instead.
 */
export const ChannelItem = ({ serverId, channel, icon: Icon, canEdit }: ChannelItemProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // The channel open in the URL, if any; its row is highlighted as active.
  const { channelId } = useParams<{ channelId?: string }>();
  const isActive = channelId === channel.id;
  const { mutate: deleteChannel, isPending: isDeleting } = useDeleteChannel();
  // "general" is the default channel: locked, so it can't be edited or deleted.
  const isLocked = channel.name === "general";

  return (
    <div
      className={cn(
        "group flex items-center rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent font-medium text-accent-foreground",
      )}
    >
      <Link
        href={`/server/${serverId}/channels/${channel.id}`}
        aria-current={isActive ? "page" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5"
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{channel.name}</span>
      </Link>

      {canEdit && isLocked && (
        <Tooltip>
          <TooltipTrigger render={<span className="mr-2 flex items-center" aria-label="Locked channel" />}>
            <LockIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>The general channel can&apos;t be changed</TooltipContent>
        </Tooltip>
      )}

      {canEdit && !isLocked && (
        <>
          <div className="mr-1 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${channel.name}`}
                    onClick={() => setEditOpen(true)}
                  />
                }
              >
                <PencilIcon />
              </TooltipTrigger>
              <TooltipContent>Edit channel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Delete ${channel.name}`}
                    onClick={() => setDeleteOpen(true)}
                  />
                }
              >
                <Trash2Icon />
              </TooltipTrigger>
              <TooltipContent>Delete channel</TooltipContent>
            </Tooltip>
          </div>
          <EditChannelModal open={editOpen} onOpenChange={setEditOpen} serverId={serverId} channel={channel} />
          <ConfirmServerModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete channel"
            description={`Are you sure? #${channel.name} will be permanently deleted.`}
            confirmLabel="Delete channel"
            isPending={isDeleting}
            onConfirm={() =>
              deleteChannel({ serverId, channelId: channel.id }, { onSuccess: () => setDeleteOpen(false) })
            }
          />
        </>
      )}
    </div>
  );
};
