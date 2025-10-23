import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (file, folderName, transformations) => {
    if (!file) return null; 

    if (!folderName) {
        throw new Error("Cloudinary folder name is required for upload.");
    }
    try {
        
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
        )}`;

        const options = {
            folder: folderName,
            resource_type: "auto", 
        };
        if (transformations) {
            options.transformation = transformations;
        } else {
            options.transformation = [
                { quality: "auto" },
                { format: "auto" }
            ];
        }
        
        const uploadResponse = await cloudinary.uploader.upload(base64Image, options);
        return uploadResponse.secure_url;
    } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new Error("Failed to upload resource to Cloudinary.");
    }
};

export default uploadToCloudinary;