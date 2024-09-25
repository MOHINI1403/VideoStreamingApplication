import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) {
      return null;
    }
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file upload has been uplaoded succesfully.
    console.log("File is uploaded on Cloudinary");
    console.log(response.url);
    return response;
  } catch (error) {
    // We should remove the file from the server
    fs.unlinkSync(localFilePath); // remove the locally saved file
    return null;
  }
};
export { uploadOnCloudinary };
