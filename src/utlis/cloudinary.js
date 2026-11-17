import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
        });

        const uploadedData = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded on cloudinary:", uploadedData.secure_url);
        return uploadedData;
    } catch (err) {
        console.log("Cloudinary upload error:", err);
        return null;
    } finally {
        
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    }
};

export { uploadOnCloudinary };