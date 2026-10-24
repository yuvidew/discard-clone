"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import type { ChannelType } from "@/features/channels/types/type";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * @component CreateChannelButton
 * @description Small "+" button that opens the create-channel dialog; reusable anywhere a channel can be added (e.g. a sidebar section label).
 * @param serverId Server the new channel is created in.
 * @param type Channel type preselected in the dialog.
 */
export const CreateChannelButton = ({ serverId, type = "TEXT" }: { serverId: string; type?: ChannelType }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Create channel"
              onClick={() => setOpen(true)}
              className="text-muted-foreground"
            />
          }
        >
          <PlusIcon />
        </TooltipTrigger>
        <TooltipContent>Create channel</TooltipContent>
      </Tooltip>
      <CreateChannelModal open={open} onOpenChange={setOpen} serverId={serverId} defaultType={type} />
    </>
  );
};
