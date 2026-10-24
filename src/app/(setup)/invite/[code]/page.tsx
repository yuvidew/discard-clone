import { InviteGate } from '@/features/setup/helper'
import { Suspense } from 'react'

/**
 * @component InvitePage
 * @description Landing page for invite links; wrapped in Suspense so Cache Components can prerender the shell.
 */
const InvitePage = ({ params }: { params: Promise<{ code: string }> }) => (
    <Suspense fallback={null}>
        <InviteGate params={params} />
    </Suspense>
)

export default InvitePage