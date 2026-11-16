import { Router } from "express";
import { fetchFriends, fetchMessages, searchUsersByUsername, addFriend } from "../controller/message.controller.js";
import { VerifyUserJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/fetchFriendList", VerifyUserJWT, fetchFriends);

router.get("/fetchMessages/:friendId", VerifyUserJWT, fetchMessages);

router.get("/searchUsers", VerifyUserJWT, searchUsersByUsername);

router.post("/addFriend", VerifyUserJWT, addFriend);

export default router;