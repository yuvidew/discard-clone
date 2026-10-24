import { ShieldAlertIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";

import type { MemberRole } from "@/features/channels/types/type";

/**
 * @component MemberRoleIcon
 * @description Shield icon for a member's role: red alert shield for admins, check shield for moderators, plain muted shield for guests.
 */
export const MemberRoleIcon = ({ role }: { role: MemberRole }) => {
  if (role === "ADMIN") return <ShieldAlertIcon className="size-4 shrink-0 text-destructive" aria-label="Admin" />;
  if (role === "MODERATOR") return <ShieldCheckIcon className="size-4 shrink-0 text-primary" aria-label="Moderator" />;
  return <ShieldIcon className="size-4 shrink-0 text-muted-foreground" aria-label="Guest" />;
};
