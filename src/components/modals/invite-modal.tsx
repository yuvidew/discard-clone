"use client";

import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useGenerateInviteCode } from "@/features/channels/hook/use-generate-invite-code";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

type InviteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverName: string;
  serverId: string;
};

/**
 * @component InviteModal
 * @description Dialog that generates a fresh invite code each time it opens and shows the resulting /invite/<code> link with copy and regenerate buttons.
 * @param serverId Server to invite people to; generating a code invalidates the previous link.
 */
export const InviteModal = ({ open, onOpenChange, serverName, serverId }: InviteModalProps) => {
  const [copied, setCopied] = useState(false);
  const { mutate, data, isPending } = useGenerateInviteCode();

  // A new code is generated every time the dialog opens.
  useEffect(() => {
    if (open) mutate(serverId);
  }, [open, serverId, mutate]);

  const inviteUrl = data ? `${window.location.origin}/invite/${data.inviteCode}` : "";

  // Copies the link and flips the icon to a check for two seconds.
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({ title: "Couldn't copy link", type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to {serverName}</DialogTitle>
          <DialogDescription>Share this link to let others join your server.</DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="invite-link">Server invite link</FieldLabel>
          <InputGroup>
            <InputGroupInput id="invite-link" readOnly value={isPending ? "Generating link..." : inviteUrl} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Copy invite link" disabled={isPending || !inviteUrl} onClick={onCopy}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Button variant="link" size="sm" className="self-start px-0" disabled={isPending} onClick={() => mutate(serverId)}>
          {isPending ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
          Generate a new link
        </Button>
      </DialogContent>
    </Dialog>
  );
};
