import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";


const userSchema = mongoose.Schema({
    
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true,
        trim: true,
    },
    password: {
         type: String,
         required: true,
         min: [8, "Password should contain atleast 8 letters"]
    },
    email: {
        type:String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        index: true,
        trim: true,
        required: true,
    },
    
    coverImage: {
        type: String,
    },
    refereshToken: {
        type: String,
    },

}, {timestamps: true});

userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        
    }
    
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName ,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User", userSchema); 