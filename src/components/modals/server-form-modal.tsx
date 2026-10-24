"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Values the shared form collects; the image is only optional where the schema allows it (edit).
export type ServerFormValues = { name: string; image?: File };

type ServerFormModalProps = {
  open: boolean;
  // Omit to make the dialog non-dismissible (first-run setup).
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  // Decides whether the image is required (create) or optional (edit).
  schema: z.ZodType<ServerFormValues, ServerFormValues>;
  // Pre-filled name when editing an existing server.
  defaultName?: string;
  // Hint shown under the image input, e.g. that leaving it empty keeps the current image.
  imageHint?: string;
  // Called with validated values; call `reset` once the request succeeded to clear the form.
  onSubmit: (values: ServerFormValues, reset: () => void) => void;
};

/**
 * @component ServerFormModal
 * @description Reusable server name + image dialog shared by "create server" and "server settings"; callers supply the copy, schema and submit handler.
 * @param schema Zod schema validating the form (image required for create, optional for edit).
 * @param defaultName Initial name; the form is re-seeded with it every time the dialog opens.
 * @param onSubmit Receives validated values plus a `reset` callback.
 */
export const ServerFormModal = ({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  pendingLabel,
  isPending,
  schema,
  defaultName = "",
  imageHint,
  onSubmit,
}: ServerFormModalProps) => {
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, image: undefined },
  });

  // Puts the form back to the server's current values (or empty when creating).
  const resetForm = () => form.reset({ name: defaultName, image: undefined });

  // Re-seed whenever the dialog opens so stale edits or a renamed server never leak into the next session.
  useEffect(() => {
    if (open) form.reset({ name: defaultName, image: undefined });
  }, [open, defaultName, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!onOpenChange) return;
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={Boolean(onOpenChange)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => onSubmit(values, resetForm))}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="server-name">Server name</FieldLabel>
                  <Input
                    {...field}
                    id="server-name"
                    placeholder="Enter server name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="image"
              control={form.control}
              render={({ field: { value: _value, onChange, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="server-image">Server image</FieldLabel>
                  <Input
                    {...field}
                    id="server-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files?.[0])}
                    aria-invalid={fieldState.invalid}
                  />
                  {imageHint && <FieldDescription>{imageHint}</FieldDescription>}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
