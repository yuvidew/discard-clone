import { ChannelView } from '@/features/channels/_components/channel-view';
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';
import { requireAuth } from '@/lib/auth-utils'
import React from 'react'

const ChannelIdPage = async () => {
    await requireAuth();
    return (
        <div className='bg-white dark:bg-[#313338] flex flex-col h-full' >
            <ChannelView navigation={<NavigationSidebar />} />
        </div>
    )
}

export default ChannelIdPage
