"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useGetServers } from '../hook/use-get-servers';
import { Spinner } from '@/components/ui/spinner';
import { CreateServerModal } from '@/components/modals/create-server-modal';

/**
 * @component HomeContent
 * @description Home view driven entirely by the API: users who already belong to a server are sent to it (which opens its first channel); everyone else gets the non-dismissible create-server dialog.
 */
export const HomeContent = () => {
    const router = useRouter();
    const { data, isPending } = useGetServers();
    const firstServer = data?.servers[0];

    // Existing members skip setup; /server/[id] then resolves the first channel.
    useEffect(() => {
        if (firstServer) router.replace(`/server/${firstServer.id}`);
    }, [firstServer, router]);

    if (isPending || firstServer) {
        return (
            <main className="flex h-screen items-center justify-center">
                <Spinner />
            </main>
        );
    }
    return (
        <main className="flex items-center gap-2 p-4">
            <CreateServerModal open />
        </main>
    )
}
