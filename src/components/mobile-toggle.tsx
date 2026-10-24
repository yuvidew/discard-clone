"use client";

import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ServerSidebar } from "@/components/server-sidebar/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * @component MobileToggle
 * @description Menu button for screens below md, where the sidebars are hidden: opens the server rail and channel sidebar together in a left sheet.
 * @param navigation The server rail (NavigationSidebar); it is an async server component, so the page passes it in as a prop.
 */
export const MobileToggle = ({ navigation }: { navigation: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet after picking a server/channel so the page behind it is visible.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu" />}>
        <MenuIcon />
      </SheetTrigger>
      {/* 65px server rail + 240px channel sidebar, same widths as the desktop layout. */}
      <SheetContent side="left" showCloseButton={false} className="w-76.25 max-w-76.25 flex-row gap-0 p-0 sm:max-w-76.25">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Switch servers and browse channels and members.</SheetDescription>
        <div className="h-full w-16.25 shrink-0 border-r">{navigation}</div>
        <div className="h-full min-w-0 flex-1">
          <ServerSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};
