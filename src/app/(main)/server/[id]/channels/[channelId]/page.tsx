import { ChannelView } from '@/features/channels/_components/channel-view';
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';
import { requireAuth } from '@/lib/auth-utils'

const ChannelIdPage = async () => {
    await requireAuth();
    return <ChannelView navigation={<NavigationSidebar />} />
}

export default ChannelIdPage
