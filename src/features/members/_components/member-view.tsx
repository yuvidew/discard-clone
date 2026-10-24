import type { ReactNode } from "react";

import { ChatHeader } from "@/features/channels/_components/chat-header";

/**
 * @component MemberView
 * @description Direct-message page body: header showing the other member's name.
 * @param name Display name of the member being messaged.
 * @param navigation Server-rendered server rail, forwarded to the header's mobile menu.
 */
export const MemberView = ({ name, navigation, imageUrl }: { name: string; navigation: ReactNode;imageUrl?: string; }) => {
  return <ChatHeader name={name} navigation={navigation} imageUrl={imageUrl} />;
};
