import { Server } from "socket.io";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    // auth middleware
    io.use((socket, next) => {
        try {
            const cookies = parse(socket.handshake.headers.cookie || "");
            const decoded = jwt.verify(cookies.accessToken, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded._id;
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(socket.userId);
        console.log("socket connected", socket.id, "userId:", socket.userId);

        socket.on("sendMessage", ({ friendId, text }) => {
            // save to the database here, then:
            io.to(friendId).emit("receiveMessage", { friendId: socket.userId, text });
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected", socket.id);
        });
    });

    return io;
};