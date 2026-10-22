"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * @component ModeToggle
 * @description Single icon button that flips between light and dark mode; shows the sun in dark mode and the moon in light mode.
 */
export const ModeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  // Swaps the icon with CSS (not state) so server and client markup match and there is no hydration flash.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </Button>
  );
};
