import { Server } from "socket.io";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Friend } from "./src/model/friend.model.js";
import { Message } from "./src/model/message.model.js";

const MESSAGE_TYPES = ["text", "image", "video", "document"];

// Only accept files hosted on your own Cloudinary account
const isTrustedFileUrl = (url) =>
    typeof url === "string" &&
    url.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`);

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

        // payload: { friendId, type: 'text'|'image'|'video'|'document', text, file?: { url, name, size, mimeType } }
        socket.on("sendMessage", async ({ friendId, type = "text", text, file } = {}, ack) => {
            try {
                if (!mongoose.isValidObjectId(friendId) || !MESSAGE_TYPES.includes(type)) {
                    return ack?.({ success: false, message: "Invalid message" });
                }

                let content = "";
                let fileData;

                if (type === "text") {
                    content = typeof text === "string" ? text.trim() : "";
                    if (!content) {
                        return ack?.({ success: false, message: "Message cannot be empty" });
                    }
                } else {
                    // file messages carry no text
                    if (!isTrustedFileUrl(file?.url)) {
                        return ack?.({ success: false, message: "Invalid file" });
                    }
                    fileData = {
                        url: file.url,
                        name: String(file.name || "file").slice(0, 200),
                        size: Number(file.size) || 0,
                        mimeType: String(file.mimeType || ""),
                    };
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
                    type,
                    content,
                    file: fileData,
                });

                const payload = {
                    id: message._id,
                    type: message.type,
                    text: message.content,
                    file: message.file?.url ? message.file : undefined,
                    time: message.createdAt,
                };

                // deliver to the friend (all their tabs and devices)
                io.to(friendId).emit("receiveMessage", { ...payload, friendId: socket.userId });

                // confirm to the sender
                ack?.({ success: true, data: payload });
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