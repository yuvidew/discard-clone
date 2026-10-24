"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { useUpdateChannel } from "@/features/channels/hook/use-update-channel";
import { updateChannelSchema, type ChannelSummary, type CreateChannelValues } from "@/features/channels/types/type";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type EditChannelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  channel: ChannelSummary;
};

/**
 * @component EditChannelModal
 * @description Dialog that renames a channel and/or changes its type.
 * @param channel The channel being edited; its current name and type prefill the form.
 */
export const EditChannelModal = ({ open, onOpenChange, serverId, channel }: EditChannelModalProps) => {
  const form = useForm<CreateChannelValues>({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: { name: channel.name, type: channel.type },
  });
  const { mutate, isPending } = useUpdateChannel();

  // Prefills with the channel's latest values each time the dialog opens.
  useEffect(() => {
    if (open) form.reset({ name: channel.name, type: channel.type });
  }, [open, channel.name, channel.type, form]);

  // Runs only when valid; closes once the channel is saved.
  const onSubmit = (values: CreateChannelValues) => {
    mutate({ ...values, serverId, channelId: channel.id }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit channel</DialogTitle>
          <DialogDescription>Rename this channel or change its type.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`edit-channel-name-${channel.id}`}>Channel name</FieldLabel>
                  <Input {...field} id={`edit-channel-name-${channel.id}`} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`edit-channel-type-${channel.id}`}>Channel type</FieldLabel>
                  <NativeSelect {...field} id={`edit-channel-type-${channel.id}`} className="w-full">
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
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
