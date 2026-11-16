import mongoose from "mongoose";
import asyncHandler from "../utlis/asyncHandler.js";
import { Friend } from "../model/friend.model.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";

const fetchFriends = asyncHandler(async (req, res) => {
    
    const userId = req.user._id;

    const friends = await Friend.aggregate([
        
        { $match: { $or: [{ userId }, { friendId: userId }] } },

        
        {
            $addFields: {
                otherId: {
                    $cond: [{ $eq: ["$userId", userId] }, "$friendId", "$userId"],
                },
            },
        },

        
        {
            $lookup: {
                from: "users",
                localField: "otherId",
                foreignField: "_id",
                as: "friendInfo",
            },
        },
        { $unwind: "$friendInfo" },

        
        {
            $lookup: {
                from: "messages",
                let: { otherId: "$otherId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $and: [{ $eq: ["$senderId", userId] }, { $eq: ["$receiverId", "$$otherId"] }] },
                                    { $and: [{ $eq: ["$senderId", "$$otherId"] }, { $eq: ["$receiverId", userId] }] },
                                ],
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                ],
                as: "lastMessage",
            },
        },
        
        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

        
        {
            $project: {
                _id: 0,
                id: "$otherId",
                name: "$friendInfo.fullName",
                username: "$friendInfo.username",
                lastMessage: { $ifNull: ["$lastMessage.content", ""] },
                time: "$lastMessage.createdAt",
                unread: { $literal: 0 }, 
            },
        },

        
        { $sort: { time: -1 } },
    ]);

    return res.status(200).json({ success: true, data: friends });
});


const fetchMessages = asyncHandler(async (req, res)=>{

    const userId = req.user._id;
    const { friendId } = req.params;

    const messages = await Message.find({
        $or: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },

        ]
    })
    .sort({ createdAt: 1 })
    .lean();

    const data = messages.map((m) => ({
        id: m._id,
        from: m.senderId.toString() === userId.toString() ? "me" : "friend",
        text: m.content,
        time: m.createdAt,
    }));

    return res.status(200).json({
        sucess: true,
        message: "Messages fetched sucessfully",
        data: data
    })
})

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchUsersByUsername = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { username } = req.query;

    // nothing typed -> empty list
    if (!username || !username.trim()) {
        return res.status(200).json({ success: true, message: "No query", data: [] });
    }

    const users = await User.find({
        username: { $regex: escapeRegex(username.trim()), $options: "i" },
        _id: { $ne: userId }, 
    })
        .select("_id username fullName")
        .limit(10)
        .lean();

    
    const data = users.map((u) => ({
        id: u._id,
        name: u.fullName,
        username: u.username,
    }));

    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data,
    });
});


const addFriend = asyncHandler(async (req, res)=>{
    const userId = req.user._id;
    const { friendId } = req.body;
    if(!friendId){
        return res.status(400).json({
            sucess: false,
            message: "friendId is required",
        })
    }

    const existingFriend = await Friend.findOne({
        $or: [
            { userId, friendId },
            { userId: friendId, friendId: userId }
        ]
   
    })

    if(existingFriend){
        return res.status(400).json({
            sucess: false,
            message: "Friend already exists",
        })
    }

    const newFriend = await Friend.create({userId, friendId});

    return res.status(201).json({
        sucess: true,
        message: "Friend added successfully",
        data: {
            id: newFriend._id,
            userId: newFriend.userId,
            friendId: newFriend.friendId,
        }
    })
})


const sendMessage = asyncHandler(async (req, res)=>{
    const userId = req.user._id;
    const { friendId, content } = req.body;

    if(!friendId || !content){
        return res.status.json({
            sucess: false,
            message: "FriendId and content are required",
        })
    }

    await Message.create({
        senderId: userId,
        receiverId: friendId,
        content
    })

    return res.status(201).json({
        sucess: true,
        message: "Message sent successfully",
    })

})
export { fetchFriends, fetchMessages, searchUsersByUsername, addFriend, sendMessage };