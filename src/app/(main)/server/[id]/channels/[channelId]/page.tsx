import { requireAuth } from '@/lib/auth-utils'
import React from 'react'

const ChannelIdPage = async ({ params }: { params: Promise<{ channelId: string }> }) => {
    await requireAuth();
    return (
        <div>ChannelIdPage </div>
    )
}

export default ChannelIdPage