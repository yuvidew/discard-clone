"use client";

import { useUpdateServer } from "@/features/setup/hook/use-update-server";
import { updateServerSchema } from "@/features/setup/types/types";
import { ServerFormModal } from "./server-form-modal";

type EditServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  // Current name, pre-filled in the form.
  serverName: string;
};

/**
 * @component EditServerModal
 * @description "Server settings" dialog: lets an admin rename the server and optionally replace its image.
 * @param serverId Server being edited.
 * @param serverName Current name used to pre-fill the form.
 */
export const EditServerModal = ({ open, onOpenChange, serverId, serverName }: EditServerModalProps) => {
  const { mutate, isPending } = useUpdateServer();

  return (
    <ServerFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Server settings"
      description="Change your server's name or image."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      isPending={isPending}
      schema={updateServerSchema}
      defaultName={serverName}
      imageHint="Leave empty to keep the current image."
      onSubmit={(values) => mutate({ serverId, ...values }, { onSuccess: () => onOpenChange(false) })}
    />
  );
};
