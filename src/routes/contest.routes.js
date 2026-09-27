import {
    getTop3Creaters,
} from "../controller/contest.controller.js";
import { Router } from "express";

const router = Router();


router.get("/top3-creater", getTop3Creaters);



export default router;