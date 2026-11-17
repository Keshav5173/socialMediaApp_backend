import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["text", "image", "video", "document"],
        default: "text",
    },
    content: {
        type: String,
        default: "",
        trim: true
    },
    file: {
        url: { type: String },
        name: { type: String },
        size: { type: Number },
        mimeType: { type: String },
    },

}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);