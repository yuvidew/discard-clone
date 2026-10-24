import type { Server as NetServer } from "http";
import type { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import type { NextApiRespnseServerIo } from "@/features/members/types/type";

// Socket.IO reads the raw request stream itself, so Next's body parser must stay off.
export const config = {
    api : {
        bodyParser: false
    }
};

// Attaches a single Socket.IO server to Next's underlying HTTP server on first hit, then reuses it.
const ioHandler = (_req: NextApiRequest, res: NextApiRespnseServerIo) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer = res.socket.server as unknown as NetServer;

        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        res.socket.server.io = io;
    }

    res.end();
}

export default ioHandler;
