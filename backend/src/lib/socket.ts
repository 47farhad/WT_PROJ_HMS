import { Server } from "socket.io"
import http from "http"
import express from "express"
import { updateLastOnline } from "../util/user.util.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

// For keeping track of connected sockets (online users). key-value is userID-SocketID
const userSocketMap: { [key: string]: string } = {};

export const getSocketID = (userID: string) => {
    return userSocketMap[userID];
}

io.on("connection", (socket) => {
    console.log("User connected with socket id:", socket.id);

    const userID = Array.isArray(socket.handshake.query.userID)
        ? socket.handshake.query.userID[0]
        : socket.handshake.query.userID ?? (() => { throw new Error('userID is required'); })();

    if (userID) userSocketMap[userID] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected with socket id:", socket.id);
        updateLastOnline(userID);
        delete userSocketMap[userID]
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
});

export { io, app, server };