"use client";

import { SettingsIcon } from "lucide-react";
import { useState } from "react";

import { useGetChannels } from "@/features/channels/hook/use-get-channels";
import { useGetMembers } from "@/features/members/hook/use-get-members";
import { MembersModal } from "@/components/modals/members-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MemberRoleIcon } from "./member-role-icon";
import Link from "next/link";
import { cn } from "cn";

/**
 * @component MemberList
 * @description Sidebar section listing the server's members, each with avatar, name and a role-based shield icon. Admins also get a settings button that opens the member management dialog.
 * @param serverId Server whose members are listed.
 */
export const MemberList = ({ serverId, memberId }: { serverId: string,  memberId: string }) => {
  const { data, isPending, isError } = useGetMembers(serverId);
  // Server name and the viewer's role come from the sidebar's already-cached channels query.
  const { data: serverData } = useGetChannels(serverId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Only admins can change roles or kick members; the members API enforces this too.
  const isAdmin = serverData?.role === "ADMIN";

  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-center justify-between ">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground">
          Members{data ? ` — ${data.members.length}` : ""}
        </h3>

        {isAdmin && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Manage members"
                  onClick={() => setSettingsOpen(true)}
                  className="text-muted-foreground"
                />
              }
            >
              <SettingsIcon />
            </TooltipTrigger>
            <TooltipContent>Manage members</TooltipContent>
          </Tooltip>
        )}
      </div>

      {isPending && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}

      {isError && <p className="px-2 text-sm text-destructive">Couldn&apos;t load members.</p>}

      {data?.members.map(({ id, role, profile }) => (
        <Link 
          key={id} 
          href={`/server/${serverId}/conversations/${id}`} 
          className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition", memberId === id && "bg-zinc-700/20 dark:bg-zinc-700")}
        >
          <Avatar className="size-6">
            <AvatarImage src={profile.imageUrl} alt={profile.name} />
            <AvatarFallback className="text-[10px]">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="truncate">{profile.name}</span>
          <span className="ml-auto">
            <MemberRoleIcon role={role} />
          </span>
        </Link>
      ))}

      {isAdmin && serverData && (
        <MembersModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          serverId={serverId}
          serverName={serverData.server.name}
          canManage={isAdmin}
        />
      )}
    </section>
  );
};
