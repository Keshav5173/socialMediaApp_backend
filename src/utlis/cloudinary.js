import { v2 as cloudinary } from "cloudinary";
import fs from "fs";





const uploadOnCloudinary = async(localFilePath)=>{
    try{
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_SECRET_KEY 
        });
        if(!localFilePath){
            return null;
        }
        const uploadedData = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded on cloudinary", uploadedData);
        return uploadedData;
    }
    catch(err){
        console.log("Cloudinary upload error:", err);



        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };