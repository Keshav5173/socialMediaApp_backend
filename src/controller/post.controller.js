import asyncHandler from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/apiError.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { Post } from "../model/post.model.js";
import { Like } from "../model/like.model.js";


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

const likePost = asyncHandler(async(req, res)=>{
    const { postId } = req.body;
    const userId = req.user._id;

    const alreadyLiked = await Like.findOne({postId, userId})

    if(alreadyLiked){
        return res.status(201).json(
            new ApiResponse(201, "Already Liked the post")
        );
    }

    const createdLike = await Like.create({
        postId,
        owner: userId
    })

    if(!createdLike){
        throw new ApiError(500, "Failed to create a Like");
    }
    return res.status(200).json(
        new ApiResponse(200, createdLike, "Sucessfully created a Like")
    );
})

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

const checkAlreadyLikedPost = asyncHandler(async(req, res)=>{
    const { postId } = req.body;
    const userId = req.user._id;

    const LikedPost = await Like.findOne({postId, userId});

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

    // Parse & validate excluded IDs — invalid ones are silently dropped,
    // never thrown, so a bad ID can't crash the request
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
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, posts, "Posts loaded successfully")
    );
});


const loadComment = asyncHandler(async (req, res) => {
    const { postId } = req.body;

    const comments = await Comment.find({postId});

    

    return res.status(200).json(
        new ApiResponse(200, comments, "Posts loaded successfully")
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