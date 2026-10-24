import { api } from "@/lib/axios";
import type { GetMembersResponse, KickMemberPayload, UpdateMemberRolePayload } from "../types/type";

// Fetches every member of a server with their profile.
export const getMembers = async (serverId: string) => {
    const { data } = await api.get<GetMembersResponse>(`/servers/${serverId}/members`);
    return data;
};

// Changes a member's role (admins only).
export const updateMemberRole = async ({ serverId, memberId, role }: UpdateMemberRolePayload) => {
    const { data } = await api.patch(`/server/${serverId}/members/${memberId}`, { role });
    return data;
};

// Removes a member from the server (admins only).
export const kickMember = async ({ serverId, memberId }: KickMemberPayload) => {
    const { data } = await api.delete(`/servers/${serverId}/members/${memberId}`);
    return data;
}