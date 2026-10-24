"use client";

import { ChevronsUpDownIcon, LogOutIcon, PlusCircleIcon, SettingsIcon, TrashIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetChannels } from "@/features/channels/hook/use-get-channels";

import { ConfirmServerModal } from "@/components/modals/confirm-server-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useModal } from "@/hooks/use-modal";
import { useDeleteServer } from "@/features/setup/hook/use-delete-server";
import { useLeaveServer } from "@/features/setup/hook/use-leave-server";


// Dialogs the header can open; only one is open at a time.
type ServerModalType = "invite" | "channel" | "settings" | "members" | "delete" | "leave";

/**
 * @component ServerHeader
 * @description Top of the server sidebar: current server image, name and the user's role. Clicking opens a dropdown of the user's servers to switch between.
 * @param serverId Id of the server currently being viewed. Admins and moderators also get an "Invite people" item that opens the invite dialog.
 */
export const ServerHeader = ({ serverId }: { serverId: string }) => {
    const { data, isPending } = useGetChannels(serverId);
    const { open: openModal, bind } = useModal<ServerModalType>();
    const { mutate: deleteServer, isPending: isDeleting } = useDeleteServer();
    const { mutate: leaveServer, isPending: isLeaving } = useLeaveServer();
    const router = useRouter();
    
    if (isPending || !data) {
        return (
            <div className="flex h-12 shrink-0 items-center gap-3 border-b-2 border-neutral-200 px-3 dark:border-neutral-800">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
            </div>
        );
    }

    const { server, role } = data;
    // Guests can't invite; the invite-code API enforces this too.
    const canInvite = role !== "GUEST";
    const isAdmin = role === "ADMIN";
    // Admins and moderators manage channels; everyone except an admin can leave.
    const canCreateChannel = role !== "GUEST";
    const canLeave = !isAdmin;
    // After a delete/leave the server is gone for this user; the root page picks another server or asks to create one.
    const goHome = () => router.push("/");

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-md font-semibold px-3 flex items-center justify-between h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                    <div className="flex min-w-0  items-center gap-1.5">
                        <Avatar>
                            <AvatarImage src={server.imageUrl} alt={server.name} className={"rounded-md"} />
                            <AvatarFallback>{server.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="w-full truncate text-sm font-semibold">{server.name}</span>
                    </div>
                    <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuGroup>
                        {canInvite && (
                            <DropdownMenuItem className={"flex items-center justify-between"} onClick={() => openModal("invite")}>
                                Invite people
                                <UserPlusIcon />
                            </DropdownMenuItem>
                        )}
                        {isAdmin && (
                            <>
                                <DropdownMenuItem className={"flex items-center justify-between"} onClick={() => openModal("settings")}>
                                    Server settings
                                    <SettingsIcon />
                                </DropdownMenuItem>
                                <DropdownMenuItem className={"flex items-center justify-between"} onClick={() => openModal("members")}>
                                    Manage members
                                    <UsersIcon />
                                </DropdownMenuItem>
                            </>
                        )}
                        {canCreateChannel && (
                            <>
                                <DropdownMenuItem className={"flex items-center justify-between"} onClick={() => openModal("channel")}>
                                    Create channel
                                    <PlusCircleIcon />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {isAdmin && (
                            <DropdownMenuItem className={"flex items-center justify-between"} variant="destructive" onClick={() => openModal("delete")}>
                                Delete server
                                <TrashIcon />
                            </DropdownMenuItem>
                        )}
                        {canLeave && (
                            <DropdownMenuItem className={"flex items-center justify-between"} variant="destructive" onClick={() => openModal("leave")}>
                                Leave server
                                <LogOutIcon />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {canInvite && (
                <InviteModal {...bind("invite")} serverName={server.name} serverId={serverId} />
            )}
            {canCreateChannel && <CreateChannelModal {...bind("channel")} serverId={serverId} />}
            {isAdmin && (
                <EditServerModal {...bind("settings")} serverId={serverId} serverName={server.name} />
            )}
            {isAdmin && (
                <MembersModal {...bind("members")} serverId={serverId} serverName={server.name} canManage={isAdmin} />
            )}
            {isAdmin && (
                <ConfirmServerModal
                    {...bind("delete")}
                    title="Delete server"
                    description={`Are you sure? ${server.name} and all of its channels will be permanently deleted.`}
                    confirmLabel="Delete server"
                    isPending={isDeleting}
                    onConfirm={() => deleteServer(serverId, { onSuccess: goHome })}
                />
            )}
            {canLeave && (
                <ConfirmServerModal
                    {...bind("leave")}
                    title="Leave server"
                    description={`Are you sure you want to leave ${server.name}? You will need a new invite to rejoin.`}
                    confirmLabel="Leave server"
                    isPending={isLeaving}
                    onConfirm={() => leaveServer(serverId, { onSuccess: goHome })}
                />
            )}
        </>
    );
};
