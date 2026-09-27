import asyncHandler from "../utlis/asyncHandler.js";
import { User } from "../model/user.model.js"

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
                                $multiply: [{$ifNull: [$likeCount, 0] }, 2]
                            },
                            {
                                $multiply: [{$ifNull: [$postCount, 0] }, 1]
                            },
                            {
                                $multiply: [{$ifNull: [$commentCount, 0] }, 3]
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


export {
    getTop3Creaters,
}