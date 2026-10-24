"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useGetServers } from "@/features/setup/hook/use-get-servers";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * @component NavigationServers
 * @description Vertical list of the servers the user created (as avatars, active one highlighted) plus a button that opens the create-server dialog.
 */
export const NavigationServers = () => {
  const { data, isPending, isError } = useGetServers();
  const params = useParams<{ id?: string }>();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {/* Same height and border as the server sidebar header so the two bottom lines meet. */}
      <div className="flex h-12 w-full shrink-0 items-center justify-center border-b-2 border-neutral-200 dark:border-neutral-800">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-md"
              aria-label="Add a server"
              onClick={() => setCreateOpen(true)}
            />
          }
        >
          <PlusIcon />
        </TooltipTrigger>
        <TooltipContent side="right">Add a server</TooltipContent>
      </Tooltip>
      </div>

      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col items-center gap-3 py-3">
          {isPending && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="size-9 rounded-md" />)}

          {isError && <p className="px-1 text-center text-xs text-destructive">Couldn&apos;t load servers</p>}

          {data?.servers.map((server) => (
            <Tooltip key={server.id}>
              <TooltipTrigger
                render={
                  <Link
                    href={`/server/${server.id}`}
                    aria-label={server.name}
                    className={cn("rounded-md", params.id === server.id && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
                  />
                }
              >
                <Avatar className="size-9 rounded-md overflow-hidden">
                  <AvatarImage src={server.imageUrl} alt={server.name} className={"rounded-none"} />
                  <AvatarFallback>{server.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">{server.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ScrollArea>

      <CreateServerModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};
