"use client";

import { UserButton } from "@clerk/nextjs";
import { useSyncExternalStore } from "react";

import { Skeleton } from "@/components/ui/skeleton";

// No-op subscription: the mounted flag never changes after hydration.
const subscribe = () => () => {};

/**
 * @component UserMenu
 * @description Clerk's account button, shown only once the client has hydrated. Clerk adds its host element on the client only, so rendering it during hydration caused a server/client mismatch; a same-size skeleton holds its place until then.
 */
export const UserMenu = () => {
  // false while rendering on the server and during hydration, true afterwards.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) return <Skeleton className="size-7 rounded-full" />;

  return <UserButton />;
};
