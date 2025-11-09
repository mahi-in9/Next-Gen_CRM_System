import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initializeSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "*" } });

initializeSocket(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
