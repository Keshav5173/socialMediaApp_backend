import {
    createPost,
    createCommentOnPost,
    likePost,
    LikeComment,
    checkAlreadyLikedComment,
    checkAlreadyLikedPost,
    loadComment,
    loadPost
} from "../controller/post.controller.js";

import { VerifyUserJWT } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();


// Create Post
router.post(
    "/create-post",
    VerifyUserJWT,
    upload.fields([
        {
            name: "post",
            maxCount: 1
        }
    ]),
    createPost
);


// Load Posts
router.get(
    "/load-post",
    VerifyUserJWT,
    loadPost
);


// Create Comment
router.post(
    "/create-comment",
    VerifyUserJWT,
    createCommentOnPost
);


// Load Comments
router.get(
    "/load-comment",
    VerifyUserJWT,
    loadComment
);


// Like Post
router.post(
    "/like-post",
    VerifyUserJWT,
    likePost
);


// Check if Post is Already Liked
router.get(
    "/check-post-like",
    VerifyUserJWT,
    checkAlreadyLikedPost
);


// Like Comment
router.post(
    "/like-comment",
    VerifyUserJWT,
    LikeComment
);


// Check if Comment is Already Liked
router.get(
    "/check-comment-like",
    VerifyUserJWT,
    checkAlreadyLikedComment
);


export default router;