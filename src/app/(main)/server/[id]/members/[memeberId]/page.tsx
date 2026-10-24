import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';
import { MemberView } from '@/features/members/_components/member-view';
import { requireAuth } from '@/lib/auth-utils'
import { getOrCreateConvesation } from '@/lib/conversation';
import { getCurrentMember } from '@/lib/current-member';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

// The route folder is spelled [memeberId], so that is the param key.
type ConversationsIdPageProps = {
    params: Promise<{ id: string; memeberId: string }>;
};

/**
 * @component ConversationGate
 * @description Opens the 1:1 conversation between the signed-in member and the member in the URL, creating it on first visit, and shows the other member's name in the header.
 */
const ConversationGate = async ({ params }: ConversationsIdPageProps) => {
    // Marks this as request-time work; Prisma reads Date.now(), which can't run during prerender.
    await connection();
    const { id: serverId, memeberId } = await params;
    const { userId } = await requireAuth();

    // The viewer's own membership in this server; no membership means they can't be here.
    const currentMember = await getCurrentMember(userId, serverId);

    if (!currentMember) {
        redirect(`/server/${serverId}`);
    }

    const conversation = await getOrCreateConvesation(currentMember.id, memeberId);

    if (!conversation) {
        redirect(`/server/${serverId}`);
    }

    const { memberOne, memberTwo } = conversation;
    // Whichever side of the conversation isn't the viewer.
    const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

    // Guards against ids from another server or a conversation with yourself.
    if (otherMember.id === currentMember.id || otherMember.serverId !== serverId) {
        redirect(`/server/${serverId}`);
    }

    return (
        <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
            <MemberView name={otherMember.profile.name} imageUrl = {otherMember.profile.imageUrl} navigation={<NavigationSidebar />} />
        </div>
    )
}

/**
 * @component ConversationsIdPage
 * @description Member conversation page; the auth/DB work is wrapped in Suspense so Cache Components can prerender the shell.
 */
const ConversationsIdPage = ({ params }: ConversationsIdPageProps) => (
    <Suspense fallback={null}>
        <ConversationGate params={params} />
    </Suspense>
)

export default ConversationsIdPage
