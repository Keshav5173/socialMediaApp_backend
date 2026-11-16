import { Server } from "socket.io";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Friend } from "./src/model/friend.model.js";
import { Message } from "./src/model/message.model.js";

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    
    io.use((socket, next) => {
        try {
            const cookies = parse(socket.handshake.headers.cookie || "");
            const decoded = jwt.verify(cookies.accessToken, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded._id.toString();
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        
        socket.join(socket.userId);

        
        socket.on("sendMessage", async ({ friendId, text }, ack) => {
            try {
                if (!mongoose.isValidObjectId(friendId) || !text?.trim()) {
                    return ack?.({ success: false, message: "Invalid message" });
                }

                const isFriend = await Friend.exists({
                    $or: [
                        { userId: socket.userId, friendId },
                        { userId: friendId, friendId: socket.userId },
                    ],
                });
                if (!isFriend) {
                    return ack?.({ success: false, message: "You are not friends with this user" });
                }

                // save to MongoDB
                const message = await Message.create({
                    senderId: socket.userId,
                    receiverId: friendId,
                    content: text.trim(),
                });

                // deliver to the friend (all their tabs and devices)
                io.to(friendId).emit("receiveMessage", {
                    id: message._id,
                    friendId: socket.userId, 
                    text: message.content,
                    time: message.createdAt,
                });

                // confirm to the sender
                ack?.({
                    success: true,
                    data: { id: message._id, text: message.content, time: message.createdAt },
                });
            } catch (err) {
                console.log(err);
                ack?.({ success: false, message: "Failed to send message" });
            }
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected", socket.id);
        });
    });

    return io;
};