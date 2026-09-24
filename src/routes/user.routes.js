import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    viewProfile


 } from "../controller/user.controller.js";

 import { VerifyUserJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", VerifyUserJWT, logoutUser);

router.post("/refreshToken", refreshAccessToken);

router.get("/viewProfile", VerifyUserJWT, viewProfile)


export default router;