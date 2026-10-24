import { z } from "zod";

import type { MemberRole } from "@/features/channels/types/type";

// A member as listed in the members dialog.
export type MemberSummary = {
  id: string;
  role: MemberRole;
  profile: { id: string; name: string; email: string; imageUrl: string };
};

// Shape of the GET /api/servers/[id]/members success response.
export type GetMembersResponse = {
  members: MemberSummary[];
  // The signed-in user's own member id, so the UI can hide actions on themselves.
  currentMemberId: string;
  // Profile id of the server's creator; their role and membership are locked.
  ownerProfileId: string;
};

// Roles an admin can assign; ADMIN is only ever held by the server's creator.
export const assignableRoleSchema = z.enum(["MODERATOR", "GUEST"]);
export type AssignableRole = z.infer<typeof assignableRoleSchema>;

// Body of PATCH /api/servers/[id]/members/[memberId].
export const updateMemberRoleSchema = z.object({ role: assignableRoleSchema });

// Variables for the change-role mutation.
export type UpdateMemberRolePayload = { serverId: string; memberId: string; role: AssignableRole };

// Variables for the kick-member mutation; `memberName` only feeds the toast.
export type KickMemberPayload = { serverId: string; memberId: string; memberName: string };
