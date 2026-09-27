import asyncHandler from "../utlis/asyncHandler.js";
import { User } from "../model/user.model.js";
import { Post } from "../model/post.model.js";

const getTop3Creaters = asyncHandler(async(req, res)=>{
    
    /*
        Likex2 + commentx3 + postCountx1
    */
    try {
        const top3Creater = await User.aggregate([
            {
                $match: {state: "Chhattisgarh"}
            },
    
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "owner",
                    as: "posts"
                }
            },
            {
                $addFields: {
                    postCount: { $size : "$posts" }
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "posts._id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$likes" }
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "posts._id",
                    foreignField: "postId",
                    as: "comments"
                }
            },
            {
                $addFields: { 
                    commentCount: { $size: "$comments" }
                }
            },
            
            {
                $addFields: {
                    score: {
                        $add: [
                            {
                                $multiply: [{$ifNull: ["$likeCount", 0] }, 2]
                            },
                            {
                                $multiply: [{$ifNull: ["$postCount", 0] }, 1]
                            },
                            {
                                $multiply: [{$ifNull: ["$commentCount", 0] }, 3]
                            }
                        ]
                    }
                }
            },
    
            {
                $sort: {
                    score: -1
                }
            },
    
            {
                $limit: 3
            },
    
    
            {
                $project: {
                    "email": 1,
                    "username": 1,
                    "fullName": 1,
                    "postCount": 1,
                    "likeCount": 1,
                    "commentCount": 1,
                    "score":1
                }
            }
    
        ]);
        return res.status(200).json({
            message: "found top 3 creater",
            data: top3Creater
        })
    } catch (error) {
        console.log("Error occured while fetching top 3 creater: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const mostLikedPosts = asyncHandler(async(req, res)=>{
    try {
        const getProfile = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },

            {
                $addFields: {
                    likeCount: { $size: "$likes" }
                }
            },
            {
                $sort: {
                    likeCount: -1
                }
            }, 
            {
                $limit: 3
            },


            {
                $project: {
                    "users.email":1,
                    "users.username": 1,
                    "users.fullName": 1,
                    "likeCount": 1,
                    "caption": 1,

                }
            }
        ]);

        return res.status(200).json({
            message: "Found winner of most liked post contest",
            data: getProfile
        })
    } catch (error) {
        console.log("Error occured while fetching top liked creater: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const mostCommentsPosts = asyncHandler(async(req, res)=>{
    try {
        const getProfile = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "postId",
                    as: "comments"
                }
            },

            {
                $addFields: {
                    commentCount: { $size: "$comments" }
                }
            },
            {
                $sort: {
                    commentCount: -1
                }
            }, 
            {
                $limit: 3
            },


            {
                $project: {
                    "users.email":1,
                    "users.username": 1,
                    "users.fullName": 1,
                    "commentCount": 1,
                    "caption": 1,

                }
            }
        ]);

        return res.status(200).json({
            message: "Found winner of most liked post contest",
            data: getProfile
        })
    } catch (error) {
        console.log("Error occured while fetching top comments creater: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const mostActiveUser = asyncHandler(async(req, res)=>{
    try {
        const top3ActiveUser = await User.aggregate([
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "owner",
                    as: "posts"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "owner",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "owner",
                    as: "comments"
                }
            },

            {
                $addFields: {
                    postCount: { $size : "$posts"}
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$likes"}
                }
            },
            {
                $addFields: {
                    commentCount: { $size: "$comments"}
                }
            },

            {
                $addFields: {
                    score: {
                        $add: [
                           {
                             $multiply: [{ $ifNull: ["$postCount", 0] },2]
                           },
                           {
                             $multiply: [{ $ifNull: ["$likeCount", 0] },1]
                           },
                           {
                             $multiply: [{ $ifNull: ["$commentCount", 0] },3]
                           }
                        ]
                    }
                }
            },

            {
                $sort: {
                    score: -1
                }
            },

            {
                $limit: 3
            },

            {
                $project: {
                    "username": 1,
                    "fullName": 1,
                    "email": 1,
                    "postCount": 1,
                    "likeCount":1,
                    "commentCount":1,
                    "score":1
                }
            }
        ])

        return res.status(200).json({
            message: "fetched top 3 active users",
            data: top3ActiveUser
        })
    } catch (error) {
        console.log("Error occured while fetching top users: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const mostActiveContributer = asyncHandler(async(req, res)=>{
    try {
        const top3ActiveUser = await User.aggregate([
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "owner",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "owner",
                    as: "comments"
                }
            },

            {
                $addFields: {
                    likeCount: { $size: "$likes"}
                }
            },
            {
                $addFields: {
                    commentCount: { $size: "$comments"}
                }
            },

            {
                $addFields: {
                    score: {
                        $add: [
                           
                           {
                             $multiply: [{ $ifNull: ["$likeCount", 0] },2]
                           },
                           {
                             $multiply: [{ $ifNull: ["$commentCount", 0] },3]
                           }
                        ]
                    }
                }
            },

            {
                $sort: {
                    score: -1
                }
            },

            {
                $limit: 3
            },

            {
                $project: {
                    "username": 1,
                    "fullName": 1,
                    "email": 1,
                    "likeCount":1,
                    "commentCount":1,
                    "score": 1
                }
            }
        ])

        return res.status(200).json({
            message: "fetched top 3 active contributers",
            data: top3ActiveUser
        })
    } catch (error) {
        console.log("Error occured while fetching top contributer: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


export {
    getTop3Creaters,
    mostLikedPosts,
    mostCommentsPosts,
    mostActiveUser,
    mostActiveContributer,
}