import axios from "axios";

import type { DeleteMessagePayload, EditMessagePayload } from "../types/type";

// Edits a message's text through the socket-aware route; ids go in the query string.
export const editMessage = async ({ socketUrl, messageId, socketQuery, content }: EditMessagePayload) => {
  const { data } = await axios.patch(`${socketUrl}/${messageId}`, { content }, { params: socketQuery });
  return data;
};

// Soft-deletes a message through the socket-aware route.
export const deleteMessage = async ({ socketUrl, messageId, socketQuery }: DeleteMessagePayload) => {
  const { data } = await axios.delete(`${socketUrl}/${messageId}`, { params: socketQuery });
  return data;
};
