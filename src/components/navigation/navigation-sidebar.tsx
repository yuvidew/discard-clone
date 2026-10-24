import { requireAuth } from '@/lib/auth-utils'
import { NavigationServers } from './navigation-servers';
import { ModeToggle } from '../mode-toggle';
import { UserButton } from '@clerk/nextjs';

export const NavigationSidebar = async () => {
    await requireAuth();
    return (
        <div className="flex h-full w-full flex-col items-center gap-0 bg-sidebar pb-3">
            <NavigationServers />
            <div className="mt-auto flex flex-col items-center gap-3">
                <ModeToggle />
                <UserButton />
            </div>
        </div>
    )
}
