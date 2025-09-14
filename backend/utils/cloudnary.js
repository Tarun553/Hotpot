import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()


const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    try {
      const result = await cloudinary.uploader.upload(file)
      await fs.unlinkSync(file)
      return result.secure_url
    } catch (error) {
        fs.unlinkSync(file)
        throw new Error('Cloudinary upload failed')
    }
}

export default uploadOnCloudinary