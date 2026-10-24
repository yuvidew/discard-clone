import { ServerSidebar } from '@/components/server-sidebar/sidebar';
import { requireAuth } from '@/lib/auth-utils'
import React, { ReactNode } from 'react'

const ServerIdLayout = async ({ children }: { children: ReactNode }) => {
    await requireAuth();
    return (
        <div className='h-full'>
            <div className='hidden md:flex border-r w-60 z-20 flex-col fixed inset-y-0 left-[65px]'>
                <ServerSidebar/>
            </div>
            <main className='h-full md:pl-60'>

                chaild {children}
            </main>
        </div>
    )
}

export default ServerIdLayout