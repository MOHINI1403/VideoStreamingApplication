import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailRegex } from "../constants.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, resp) => {
  const { fullName, email, userName, password } = req.body;
  // Check for the Validations :
  if (
    [fullName, email, userName, password].some(
      (field) => field == null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are compulsory or required!!");
  }
  /*if (!emailRegex.test(email)) {
    throw new ApiError(
      400,
      "The Email Formatting is not Correct Please enter the Correct Email format !!"
    );
  }*/
  // Check weather the User Already Exists or not :
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "The User already exists with the current Email or UserName"
    );
  }
  // The Images uploaded by Multer in Req is fetched from the request body.
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required !");
  }
  // Upload Them to Cloudinary.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar File is Required !");
  }
  console.log('Avatar Created');
  // Create a Object and Enter the Details in Database :
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  console.log('User Created');
  // check for user creation : Also removing certain columns from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went Wrong while registering the User !"
    );
  }
  // Crafting the Response and Returning it .
  return resp
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Succesfully !"));
});
export { registerUser };
