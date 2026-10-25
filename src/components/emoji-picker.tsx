"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import { SmileIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EmojiPickerProps {
  onChange: (emoji: string) => void;
  disabled?: boolean;
}

/**
 * @component EmojiPicker
 * @description Smile button that opens an emoji-mart picker in a popover and reports the chosen emoji as a native character.
 * @param onChange Called with the selected emoji (e.g. "😀"); the popover closes afterwards.
 */
export const EmojiPicker = ({ onChange, disabled }: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();
  // Controlled so the popover can close itself once an emoji is picked.
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Add emoji"
            disabled={disabled}
          />
        }
      >
        <SmileIcon />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="w-auto border-none bg-transparent p-0 shadow-none ring-0"
      >
        <Picker
          data={data}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          previewPosition="none"
          onEmojiSelect={(emoji: { native: string }) => {
            onChange(emoji.native);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
