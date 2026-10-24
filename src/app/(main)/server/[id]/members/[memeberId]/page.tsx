import { requireAuth } from '@/lib/auth-utils'
import React from 'react'

const ConversationsIdPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    await requireAuth();
    return (
        <div>ConversationsIdPage</div>
    )
}

export default ConversationsIdPage