"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { useCreateChannel } from "@/features/channels/hook/use-create-channel";
import { createChannelSchema, type ChannelType, type CreateChannelValues } from "@/features/channels/types/type";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type CreateChannelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  // Channel type preselected each time the dialog opens; defaults to TEXT.
  defaultType?: ChannelType;
};

/**
 * @component CreateChannelModal
 * @description Dialog that creates a text, audio or video channel in the given server.
 * @param defaultType Channel type preselected when the dialog opens (e.g. the section it was opened from).
 */
export const CreateChannelModal = ({ open, onOpenChange, serverId, defaultType = "TEXT" }: CreateChannelModalProps) => {
  const form = useForm<CreateChannelValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { name: "", type: defaultType },
  });
  const { mutate, isPending } = useCreateChannel();

  // Starts each opening with an empty name and the requested type.
  useEffect(() => {
    if (open) form.reset({ name: "", type: defaultType });
  }, [open, defaultType, form]);

  // Runs only when valid; closes and resets the form once the channel exists.
  const onSubmit = (values: CreateChannelValues) => {
    mutate(
      { ...values, serverId },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create channel</DialogTitle>
          <DialogDescription>Add a text, voice or video channel to this server.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="channel-name">Channel name</FieldLabel>
                  <Input {...field} id="channel-name" placeholder="new-channel" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="channel-type">Channel type</FieldLabel>
                  <NativeSelect {...field} id="channel-type" className="w-full">
                    <NativeSelectOption value="TEXT">Text</NativeSelectOption>
                    <NativeSelectOption value="AUDIO">Voice</NativeSelectOption>
                    <NativeSelectOption value="VIDEO">Video</NativeSelectOption>
                  </NativeSelect>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {isPending ? "Creating..." : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
