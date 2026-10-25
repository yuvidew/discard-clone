"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ConfirmServerModal } from "@/components/modals/confirm-server-modal";
import { MemberRoleIcon } from "@/components/server-sidebar/member-role-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";
import { useDeleteMessage } from "../hook/use-delete-message";
import { useEditMessage } from "../hook/use-edit-message";
import { editMessageSchema } from "../types/type";
import type { ChannelMember, EditMessageValues, MemberRole, MessageWithMemberWithProfile } from "../types/type";

// Text shown in the tooltip over the author's role icon.
const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  GUEST: "Guest",
};

interface ChatItemProps {
  id: string;
  // The signed-in user's membership; will gate edit/delete actions.
  currentMember: ChannelMember;
  // The message author.
  member: MessageWithMemberWithProfile["member"];
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  // Pre-formatted creation time.
  timestamp: string;
  // True when the message was edited after being sent.
  isUpdated: boolean;
  // Socket endpoint and query for edit/delete calls (not used yet).
  socketUrl: string;
  socketQuery: Record<string, string>;
}

/**
 * @component ChatItem
 * @description One chat message: author avatar, name with role icon and timestamp, the text, and the attached image when there is one.
 * @param currentMember Gates the toolbar: authors can edit/delete, admins and moderators can delete.
 * @param socketUrl, socketQuery Route and ids used by the edit/delete requests.
 */
export const ChatItem = ({
  id,
  member,
  content,
  deleted,
  timestamp,
  isUpdated,
  currentMember,
  fileUrl,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const { profile } = member;

  // True while this message's text is swapped for the inline edit form.
  const [isEditing, setIsEditing] = useState(false);
  // Controls the delete confirmation dialog.
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate: edit, isPending: isEditPending } = useEditMessage();
  const { mutate: remove, isPending: isDeleting } = useDeleteMessage();

  // The chat's TanStack key (same shape ChatMessages builds); refreshed after an edit/delete.
  const queryKey = `chat:${socketQuery.channelId ?? socketQuery.conversationId}`;

  const form = useForm<EditMessageValues>({
    resolver: zodResolver(editMessageSchema),
    defaultValues: { content },
  });

  // Escape closes the edit form without saving.
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEditing(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  // Opens the edit form pre-filled with the current text.
  const startEditing = () => {
    form.reset({ content });
    setIsEditing(true);
  };

  // Saves the edited text and closes the form once the request succeeds.
  const onSubmit = ({ content: nextContent }: EditMessageValues) => {
    edit(
      { socketUrl, messageId: id, socketQuery, queryKey, content: nextContent },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  // Soft-deletes the message and closes the dialog once the request succeeds.
  const confirmDelete = () => {
    remove({ socketUrl, messageId: id, socketQuery, queryKey }, { onSuccess: () => setIsDeleteOpen(false) });
  };

  // File extension of the attachment, ignoring any query string, to tell PDFs from images.
  const fileType = fileUrl?.split("?")[0].split(".").pop()?.toLowerCase();

  const isAdmin = currentMember.role === "ADMIN";
  const isModerator = currentMember.role === "MODERATOR";
  const isOwner = currentMember.id === member.id;
  // Admins/moderators may delete anyone's message; authors may delete their own.
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  // Only the author may edit, and only text-only messages.
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = !!fileUrl && fileType === "pdf";
  const isImage = !!fileUrl && !isPDF;

  return (
    <div className="group flex w-full items-start gap-x-3 px-4 py-2 transition hover:bg-black/5 dark:hover:bg-white/5">
      <Avatar size="lg" className="mt-0.5">
        <AvatarImage src={profile.imageUrl} alt={profile.name} />
        <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-x-2">
          <p className="truncate text-sm font-semibold">{profile.name}</p>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex cursor-default" />}>
              <MemberRoleIcon role={member.role} />
            </TooltipTrigger>
            <TooltipContent>{ROLE_LABELS[member.role]}</TooltipContent>
          </Tooltip>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
        </div>

        {isImage && !deleted && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-2 block size-48 overflow-hidden rounded-md border bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Appwrite host isn't in next/image's allow-list. */}
            <img src={fileUrl} alt="Attachment" className="size-full object-cover" />
          </a>
        )}

        {isPDF && !deleted && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-fit items-center gap-2 rounded-md border bg-secondary p-2 text-sm text-primary hover:underline"
          >
            <FileTextIcon className="size-8 shrink-0" />
            PDF file
          </a>
        )}

        {!isEditing && (
          <p
            className={cn(
              "wrap-break-word text-sm text-zinc-600 dark:text-zinc-300",
              deleted && "text-xs italic text-zinc-500 dark:text-zinc-400"
            )}
          >
            {deleted ? "This message has been deleted." : content}
            {isUpdated && !deleted && (
              <span className="mx-2 text-[10px] text-zinc-500 dark:text-zinc-400">(edited)</span>
            )}
          </p>
        )}

        {isEditing && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-1 flex flex-col gap-2">
            <Controller
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    autoFocus
                    autoComplete="off"
                    disabled={isEditPending}
                    aria-label="Edit message"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={isEditPending}>
                {isEditPending && <Spinner data-icon="inline-start" />}
                {isEditPending ? "Saving…" : "Save"}
              </Button>
              <Button type="button" size="sm" variant="ghost" disabled={isEditPending} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Press Esc to cancel, Enter to save</span>
            </div>
          </form>
        )}
      </div>

      {/* Hover toolbar: edit swaps the text for an input, delete opens a confirmation. */}
      {!isEditing && (canEditMessage || canDeleteMessage) && (
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {canEditMessage && (
            <Tooltip>
              <TooltipTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Edit message" onClick={startEditing} />}
              >
                <PencilIcon />
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          )}
          {canDeleteMessage && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete message"
                    onClick={() => setIsDeleteOpen(true)}
                  />
                }
              >
                <TrashIcon />
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      <ConfirmServerModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete message"
        description="Are you sure you want to delete this message? This can't be undone."
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
