import { HomeContent } from '@/features/setup/_components/view'
import { requireAuth } from '@/lib/auth-utils'
import React from 'react'

const Home = async () => {
    await requireAuth()
  return (
    <HomeContent/>
  )
}

export default Home