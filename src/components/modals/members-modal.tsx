"use client";

import { EllipsisVerticalIcon, GavelIcon, ShieldAlertIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";

import type { MemberRole } from "@/features/channels/types/type";
import { useGetMembers } from "@/features/members/hook/use-get-members";
import { useKickMember } from "@/features/members/hook/use-kick-member";
import { useUpdateMemberRole } from "@/features/members/hook/use-update-member-role";
import { assignableRoleSchema, type MemberSummary } from "@/features/members/types/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

type MembersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  serverName: string;
  // Only admins get the role / kick menu; everyone else just sees the list.
  canManage: boolean;
};

// Shield shown next to a member's name: admins and moderators get one, guests none.
const ROLE_ICON: Record<MemberRole, React.ReactNode> = {
  ADMIN: <ShieldAlertIcon className="size-4 text-destructive" aria-label="Admin" />,
  MODERATOR: <ShieldCheckIcon className="size-4 text-primary" aria-label="Moderator" />,
  GUEST: null,
};

// Human-readable role names for the role submenu.
const ROLE_LABEL: Record<"MODERATOR" | "GUEST", string> = { MODERATOR: "Moderator", GUEST: "Guest" };

/**
 * @component MembersModal
 * @description Dialog listing every member of a server (image, name with role shield, email). Admins also get a three-dot menu per member with a nested role picker and a kick action.
 * @param serverId Server whose members are listed.
 * @param canManage Whether the viewer is an admin and may change roles or remove members.
 */
export const MembersModal = ({ open, onOpenChange, serverId, serverName, canManage }: MembersModalProps) => {
  // Members are only fetched while the dialog is open.
  const { data, isPending, isError } = useGetMembers(serverId, open);
  const { mutate: updateRole, isPending: isUpdatingRole, variables: updateRoleVariables } = useUpdateMemberRole();
  const { mutate: kickMember, isPending: isKicking, variables: kickVariables } = useKickMember();

  // A member whose role or membership is being changed right now, so just their row shows a spinner.
  const busyMemberId = isUpdatingRole
    ? updateRoleVariables?.memberId
    : isKicking
      ? kickVariables?.memberId
      : undefined;

  // The creator and the viewer themselves can't be modified (the API enforces this too).
  const isManageable = (member: MemberSummary) =>
    canManage && member.id !== data?.currentMemberId && member.profile.id !== data?.ownerProfileId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage members</DialogTitle>
          <DialogDescription>
            {data ? `${data.members.length} member${data.members.length === 1 ? "" : "s"} in ${serverName}` : serverName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-1 pr-3">
            {isPending && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            ))}

            {isError && <p className="p-2 text-sm text-destructive">Couldn&apos;t load members.</p>}

            {data?.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-md p-2">
                <Avatar className="size-10">
                  <AvatarImage src={member.profile.imageUrl} alt={member.profile.name} />
                  <AvatarFallback>{member.profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="truncate">{member.profile.name}</span>
                    {ROLE_ICON[member.role]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{member.profile.email}</span>
                </div>

                {busyMemberId === member.id && <Spinner />}

                {isManageable(member) && busyMemberId !== member.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.profile.name}`} />}
                    >
                      <EllipsisVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuGroup>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <ShieldIcon />
                            Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={member.role}
                              onValueChange={(value) => {
                                const role = assignableRoleSchema.safeParse(value);
                                if (role.success && role.data !== member.role) {
                                  updateRole({ serverId, memberId: member.id, role: role.data });
                                }
                              }}
                            >
                              {assignableRoleSchema.options.map((role) => (
                                <DropdownMenuRadioItem key={role} value={role}>
                                  {ROLE_LABEL[role]}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => kickMember({ serverId, memberId: member.id, memberName: member.profile.name })}
                        >
                          <GavelIcon />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
