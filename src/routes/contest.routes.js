import {
    getTop3Creaters,
    mostActiveContributer,
    mostActiveUser,
    mostCommentsPosts,
    mostLikedPosts,
} from "../controller/contest.controller.js";
import { Router } from "express";

const router = Router();


router.get("/top3-creater", getTop3Creaters);

router.get("/mostlikedpost", mostLikedPosts);

router.get("/mostcommentpost", mostCommentsPosts);

router.get("/most-active-user", mostActiveUser);

router.get("/most-advive-contributer", mostActiveContributer);

export default router;