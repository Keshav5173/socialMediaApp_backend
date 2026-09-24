import mongoose from "mongoose";


const postSchema = mongoose.Schema({
    postFile: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    caption:{
        type: String,
        trim: true,
        required: true
    },
    type: {
        type: String,
        enum: ["Photo", "Video"]
    },
    size: {
        type: String,
        required: true
    }
},
{
    timestamps: true
})


export const Post = mongoose.model("Post", postSchema); 