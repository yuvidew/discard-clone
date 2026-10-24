import { api } from "@/lib/axios";
import type { CreateChannelPayload, DeleteChannelPayload, GetChannelsResponse, UpdateChannelPayload } from "../types/type";

// Fetches a server's name and all of its channels.
export const getChannels = async (serverId: string) => {
  const { data } = await api.get<GetChannelsResponse>(`/servers/${serverId}/channels`);
  return data;
};

// Creates a channel in a server.
export const createChannel = async ({ serverId, ...body }: CreateChannelPayload) => {
  const { data } = await api.post(`/servers/${serverId}/channels`, body);
  return data;
};

// Generates a new invite code for a server and returns it.
export const generateInviteCode = async (serverId: string) => {
  const {data} = await api.post<{inviteCode: string}>(`/servers/${serverId}/invite-code`);

  return data;
};

// Renames a channel and/or changes its type.
export const updateChannel = async ({ serverId, channelId, ...body }: UpdateChannelPayload) => {
  const { data } = await api.patch(`/servers/${serverId}/channels/${channelId}`, body);
  return data;
};

// Deletes a channel from a server.
export const deleteChannel = async ({ serverId, channelId }: DeleteChannelPayload) => {
  const { data } = await api.delete(`/servers/${serverId}/channels/${channelId}`);
  return data;
};

