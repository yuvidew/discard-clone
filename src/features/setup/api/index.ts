import { api } from "@/lib/axios"
import { CreateServerPayload, CreateServerResponse, GetServersResponse, UpdateServerPayload, UpdateServerResponse } from "../types/types";

// Creates a server: sends the name and image file as multipart form data.
export const createServer = async ({ name, image }: CreateServerPayload) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("image", image);

  const { data } = await api.post<CreateServerResponse>("/servers", formData);
  return data;
};

// Fetches the servers the signed-in user belongs to.
export const getServers = async () => {
    const { data } = await api.get<GetServersResponse>("/servers");

    return data;
};

// Deletes a server (admins only).
export const deleteServer = async (serverId: string) => {
  const {data} = await api.delete(`/servers/${serverId}`);

  return data;
};

// Updates a server's name and, when a new file is picked, its image (admins only).
export const updateServer = async ({serverId, name, image}: UpdateServerPayload) => {
  const formData = new FormData();
  formData.append("name", name);
  if (image) formData.append("image", image);

  const { data } = await api.patch<UpdateServerResponse>(`/servers/${serverId}`, formData);

  return data;
};

// Removes the signed-in user from a server.
export const leaveServer = async (serverId: string) => {
  const { data } = await api.post(`/servers/${serverId}/leave`);

  return data;
};