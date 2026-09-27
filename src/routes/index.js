

import { Router } from 'express';

import userRouter from './user.routes.js';
import postRouter from "./post.routes.js";
import contestRouter from "./contest.routes.js";



const router  = Router();

router.use("/users", userRouter);
router.use("/post", postRouter);
router.use("/contest", contestRouter);





export default router;