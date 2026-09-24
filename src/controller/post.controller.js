import asyncHandler from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/apiError.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { Post } from "../model/post.model.js";
import { Like } from "../model/like.model.js";
import { Comment } from "../model/comment.model.js"
import mongoose from "mongoose";


const createPost = asyncHandler(async(req, res)=>{
    const { caption, type, size } = req.body;
    const userId = req.user._id;

    const files = req.files;

    const postPathUrl = files.post[0].path;

    const postUrl = await uploadOnCloudinary(postPathUrl);

    if(!postUrl){
        throw new ApiError(500, "Failed to upload post");
    }
    console.log("file url: ", postUrl);

    const createdPost = await Post.create({
        caption,
        size,
        type,
        postFile: postUrl.secure_url,
        owner: userId
    })

    if(!createdPost){
        throw new ApiError(500, "Failed to save data");
    }
    console.log("Created post data", createdPost);
    return res.status(200).json(
        new ApiResponse(200, createdPost, "Sucessfully created post")
    );
})

const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "A valid postId is required" });
    }

    const alreadyLiked = await Like.exists({ postId, owner: userId });

    if (alreadyLiked) {
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Already liked the post")
        );
    }

    let createdLike;
    try {
        createdLike = await Like.create({ postId, owner: userId });
    } catch (err) {
        if (err.code === 11000) {
            
            return res.status(200).json(
                new ApiResponse(200, { liked: true }, "Already liked the post")
            );
        }
        throw err;
    }

    return res.status(200).json(
        new ApiResponse(200, createdLike, "Successfully created a like")
    );
});

const LikeComment = asyncHandler(async(req, res)=>{
    const { commentId } = req.body;
    const userId = req.user._id;

    const alreadyLiked = await Comment.findOne({commentId, userId});

    if(alreadyLiked){
        return res.status(201).json(
            new ApiResponse(201, "Already Liked the comment")
        );
    }

    const createdLike = await Comment.create({
        commentId,
        owner: userId
    })

    if(!createdLike){
        throw new ApiError(500, "Failed to create a Like");
    }
    return res.status(200).json(
        new ApiResponse(200, createdLike, "Sucessfully created a Like")
    );

})

const createCommentOnPost = asyncHandler(async(req, res)=>{
    const { postId, content } = req.body;
    const userId = req.user._id;

    const createComment = await Comment.create({
        postId,
        owner: userId,
        content
    })

    if(!createComment){
        throw new ApiError(500, "failed to create Comment");
    }

    return res.status(200).json(
        new ApiResponse(200, createComment)
    )
})

const checkAlreadyLikedPost = asyncHandler(async (req, res) => {
    const { postId } = req.query;
    const userId = req.user._id;

    const likedPost = await Like.exists({ postId, userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            { alreadyLikedPost: Boolean(likedPost) },
            likedPost ? "Already liked" : "Not liked"
        )
    );
});


const checkAlreadyLikedComment = asyncHandler(async(req, res)=>{
    const { commentId } = req.body;
    const userId = req.user._id;

    const LikedPost = await Like.findOne({commentId, userId});

    if(!LikedPost){
        return res.status(200).json({
            sucess: false,
            message: "Not Liked"
        });
    }
    return res.status(200).json({
        sucess: true,
        message: "already Liked"
    });
})


const loadPost = asyncHandler(async (req, res) => {
    const { exclude, limit } = req.query;
    const userId = req.user._id;

    const excludeIds = exclude
        ? exclude
              .split(",")
              .map(id => id.trim())
              .filter(id => mongoose.Types.ObjectId.isValid(id))
              .map(id => new mongoose.Types.ObjectId(id))
        : [];

    // Clamp page size so clients can't request absurd amounts
    const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

    const posts = await Post.aggregate([
        {
            $match: {
                _id: { $nin: excludeIds }
            }
        },
        {
            $sample: { size: pageSize }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            // Count likes without pulling every like document into memory —
            // the pipeline inside $lookup does the counting on the DB side.
            $lookup: {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
                    { $count: "count" }
                ],
                as: "likeInfo"
            }
        },
        {
            // Same idea, but scoped to the requesting user only — tells us
            // whether *they* already liked this post.
            $lookup: {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$postId", "$$postId"] },
                                    { $eq: ["$owner", userId] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: "userLikeInfo"
            }
        },
        {
            $addFields: {
                likeCount: {
                    $ifNull: [{ $arrayElemAt: ["$likeInfo.count", 0] }, 0]
                },
                isLiked: {
                    $gt: [{ $size: "$userLikeInfo" }, 0]
                }
            }
        },
        {
            $project: {
                postFile: 1,
                caption: 1,
                type: 1,
                size: 1,
                createdAt: 1,
                updatedAt: 1,
                likeCount: 1,
                isLiked: 1,
                "owner._id": 1,
                "owner.fullName": 1
            }
        }
    ]);
    console.log("Posts: ", posts);

    return res.status(200).json({
        message: "Successfully fetched posts",
        data: posts,
        success: true
    });
});

const loadComment = asyncHandler(async (req, res) => {
    const { postId } = req.query;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "A valid postId is required" });
    }

    const comments = await Comment.aggregate([
        {
            $match: { postId: new mongoose.Types.ObjectId(postId) }
        },
        {
            $sort: { createdAt: 1 } // oldest first, so new comments land at the bottom
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullName": 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments loaded successfully")
    );
});


export {
    createPost,
    likePost,
    LikeComment,
    createCommentOnPost,
    checkAlreadyLikedComment,
    checkAlreadyLikedPost,
    loadComment,
    loadPost
};