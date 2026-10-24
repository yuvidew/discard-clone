import { NavigationSidebar } from '@/components/navigation/navigation-sidebar'
import { ReactNode } from 'react'

const MainLayout = ({
    children
}: { children: ReactNode }) => {
  return (
    <div className='h-full'>
        <div className='hidden md:flex h-full border w-[65px] z-30 flex-col fixed inset-y-0'>
            <NavigationSidebar/>
        </div>
        <main className='md:pl-[65px] h-full'>
        {children}
        </main>
    </div>
  )
}

export default MainLayout