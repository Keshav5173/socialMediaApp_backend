import mongoose from "mongoose";


const likeSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commnent"
    }
}, {timestamps: true});

export const Like = mongoose.model("Like", likeSchema);