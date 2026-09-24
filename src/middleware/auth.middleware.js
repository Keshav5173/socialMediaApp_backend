import { ApiError } from "../utlis/apiError.js";
import asyncHandler from "../utlis/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";

export const VerifyUserJWT = asyncHandler(async (req, res, next) =>{
    try {
        const token  = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log("access token", token);
        if(!token){
            throw new ApiError(401, "Unauthorised access");
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Access token");
        }

        req.user = user;
    
        next();
    } catch (error) {
        console.log("Error at decoding access token", error);
    }
})