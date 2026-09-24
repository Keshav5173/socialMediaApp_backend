import asyncHandler from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/apiError.js";
import { User } from "../model/user.model.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    }catch(err){
        console.log("Error occured while creating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res)=>{
    
    const {fullName, username, email, state, city, password} = req.body;


    if(
        [fullName, username, email, state, city, password].some((feild) => feild?.trim()=="")
    ){
        throw new ApiError(400, "All Feilds are required");
    }
    console.log("Email: ",email)
    const existedUser = await User.findOne({email});
    if(existedUser){
        return res.status(409).json({
            message: "User already exists Kindly Login",
            sucess: false
        })
    }

    const checkUsername = await User.findOne({username});

    if(checkUsername){
        return res.status(409).json({
            message: "Username already used try another",
            sucess: false
        })
    }

    const user = await User.create({
        fullName, 
        username: username.toLowerCase(), 
        email,
        state,
        city,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Sucessfully created user")
    );
})


const loginUser= asyncHandler(async (req, res)=>{
    const {username, email, password} = req.body;


    if(!username && !email){
        throw new ApiError(404, "username or email is required")
    }

    const user = await User.findOne({$or: [{email}, {username: email}]});

    if(!user){
        throw new ApiError(404, "User with username or email does not exists")
    }
    const isPassValid = await user.isPasswordCorrect(password);

    if(!isPassValid){
        throw new ApiError(401, "Password or username or email is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options)
                        .cookie("refreshToken", refreshToken, options)
                        .json(new ApiResponse(200, {
                            user: loggedInUser, accessToken, refreshToken
                        },
                        "User logged in sucessfully"
                    ))
})


const logoutUser = asyncHandler(async(req, res)=>{
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    );
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged Out sucessfully"))
})

const viewProfile = asyncHandler(async(req, res)=>{
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password -refreshToken");

    if(!user){
        res.status(404).json({
            message: "User not found"
        })
    }
    return res.status(200).json({
        message: "User detailes fetched",
        sucess: true,
        data: user
    })
})


const refreshAccessToken = asyncHandler(async (req, res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorised request");
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if(user.refreshToken!==incomingRefreshToken){
            throw new ApiError(401, "refresh token expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(new ApiResponse(200, {accessToken, refreshToken} , "Updated Access Token"));
    } catch (error) {
        console.log("Error occured during refresh access token", error);
        throw new ApiError(401, error || "Invalid refresh token");
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, viewProfile };

