import { Router } from "express";
import { fetchFriends, fetchMessages, searchUsersByUsername, addFriend, uploadFile } from "../controller/message.controller.js";
import { VerifyUserJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.get("/fetchFriendList", VerifyUserJWT, fetchFriends);

router.get("/fetchMessages/:friendId", VerifyUserJWT, fetchMessages);

router.get("/searchUsers", VerifyUserJWT, searchUsersByUsername);

router.post("/addFriend", VerifyUserJWT, addFriend);

router.post("/upload", VerifyUserJWT, 
    upload.fields([
        {
            name: "file",
            maxCount: 1
        }
    ]),
    uploadFile
);

export default router;