import { useCreateServer } from '@/features/setup/hook/use-create-server';
import { useRouter } from 'next/navigation';
import { ServerFormModal } from './server-form-modal';
import { createServerSchema } from '@/features/setup/types/types';

interface CreateServerModalProps {
  open: boolean;
  // Omit to make the dialog non-dismissible (first-run setup).
  onOpenChange?: (open: boolean) => void;
};

/**
 * @component CreateServerModal
 * @description Dialog that asks for a server name and image file (uploaded to Appwrite on submit), creates the server, then opens its default channel.
 * @param open Controls visibility.
 * @param onOpenChange When provided the dialog can be dismissed (close button, Esc, overlay); when omitted it cannot, so the user must create a server.
 */

export const CreateServerModal = ({ open, onOpenChange }: CreateServerModalProps) => {
  const router = useRouter();
  const { mutate, isPending } = useCreateServer();
  return (
    <ServerFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Customize your server"
      description="Give your server a name and upload an image. You can always change these later."
      submitLabel="Create server"
      pendingLabel="Creating..."
      isPending={isPending}
      schema={createServerSchema}
      onSubmit={(values, reset) => {
        // The create schema guarantees an image, so the non-null assertion is safe.
        mutate(
          { name: values.name, image: values.image! },
          {
            onSuccess: ({ server, channelId }) => {
              reset();
              onOpenChange?.(false);
              // Land on the default channel; /server/[id] resolves it if the id is missing.
              router.push(channelId ? `/server/${server.id}/channels/${channelId}` : `/server/${server.id}`);
            },
          },
        );
      }}
    />
  )
}
