"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, PlusIcon, SendIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { EmojiPicker } from "@/components/emoji-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUploadImage } from "@/features/upload/hook/use-upload-image";
import { getErrorMessage } from "@/lib/get-error-message";
import axios from "axios";

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, string>;
    name: string;
    type: "conversation" | "channel"
    placeholder: string
}

// Text may be empty when an image is attached; onSubmit enforces "text or image".
const formSchema = z.object({
    content: z.string().trim(),
});

type FormSchemaType = z.infer<typeof formSchema>;

/**
 * @component ChatInput
 * @description Message box pinned to the bottom of a chat page: a plus menu on the left, the text field, and a send button on the right.
 * @param placeholder Hint text, e.g. "Message #general".
 */
export const ChatInput = ({ apiUrl, query, name, type, placeholder }: ChatInputProps) => {
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        },
    });

    // Hidden native file picker, opened from the plus menu.
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Public Appwrite URL of the image attached to the next message, once its upload has finished.
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

    const isLoading = form.formState.isSubmitting;
    const content = useWatch({ control: form.control, name: "content" });

    // Uploads the picked image to Appwrite and keeps its URL for the next send.
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Clear the input so picking the same file again still fires onChange.
        event.target.value = "";
        if (!file) return;

        uploadImage(file, { onSuccess: ({ url }) => setFileUrl(url) });
    };

    // Posts the message and any attached image URL to apiUrl (ids go in the query string) and clears the box; failures show a toast and keep the draft.
    const onSubmit = async (value: FormSchemaType) => {
        if (!value.content && !fileUrl) return;

        try {
            await axios.post(apiUrl, { ...value, fileUrl }, { params: query });
            form.reset();
            setFileUrl(null);
        } catch (error) {
            toast.add({
                title: "Couldn't send message",
                description: getErrorMessage(error, "Please try again."),
                type: "error",
            });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="shrink-0 px-4 pb-6">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {(fileUrl || isUploading) && (
                <div className="mb-2 flex">
                    <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                        {fileUrl && (
                            // eslint-disable-next-line @next/next/no-img-element -- Appwrite host isn't in next/image's allow-list.
                            <img src={fileUrl} alt="Attachment preview" className="size-full object-cover" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                <Spinner />
                            </div>
                        )}
                    </div>
                    {fileUrl && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            aria-label="Remove image"
                            onClick={() => setFileUrl(null)}
                            className="-ml-3 -mt-2 size-6 rounded-full"
                        >
                            <XIcon />
                        </Button>
                    )}
                </div>
            )}
            <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <InputGroup className="h-11 bg-zinc-200/90 dark:bg-zinc-700/75">
                            <InputGroupAddon align="inline-start">
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Add to message"
                                                className="rounded-full"
                                            />
                                        }
                                    >
                                        <PlusIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" side="top" className="w-44">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                                <ImageIcon />
                                                Upload an image
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </InputGroupAddon>

                            <InputGroupInput
                                {...field}
                                id="chat-input"
                                autoComplete="off"
                                disabled={isLoading}
                                placeholder={placeholder}
                                aria-label={`Message ${type === "channel" ? "#" : "@"}${name}`}
                                aria-invalid={fieldState.invalid}
                            />

                            <InputGroupAddon align="inline-end">
                                <EmojiPicker
                                    disabled={isLoading}
                                    onChange={(emoji) => field.onChange(`${field.value}${emoji}`)}
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Send message"
                                    disabled={isLoading || isUploading || (!content.trim() && !fileUrl)}
                                >
                                    {isLoading ? <Spinner /> : <SendIcon />}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                )}
            />
        </form>
    );
};
