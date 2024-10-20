import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailRegex } from "../constants.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generarteAccessToken();
    const refreshToken = user.generarterefreshToken();
    // Adding the refreshToken into the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Access and Refresh Token"
    );
  }
};

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
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required !");
  }
  // Upload Them to Cloudinary.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar File is Required !");
  }
  // Create a Object and Enter the Details in Database :
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
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

const loginUser = asyncHandler(async (req, resp) => {
  const { email, userName, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(400, "Username or Email is Required !");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User Does'nt Exist !");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // Send them into cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return resp
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, resp) => {
  // Clear out the cookies -> Access Token and Refresh Token needs to be changed.
  const userId = req.user._id;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return resp
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});
const refreshAccessToken = asyncHandler(async (req, resp) => {
  // From Cookies the Refresh token is Accessed and if found verify with the one stored in DB
  const incomingrefreshtoken = req.cookie.refreshToken || req.body.refreshToken;
  if (!incomingrefreshtoken) {
    throw new ApiError(401, "Unauthorised Request !");
  }
  try {
    const decodedrefreshToken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedrefreshToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token !");
    }
    if (user?.refreshToken != incomingrefreshtoken) {
      throw new ApiError(401, "The Refresh Token is Expired Login Again !");
    }
    // Now generate the new access_token and refresh_token
    const { accessToken, newrefreshToken } = generateAccessAndRefreshToken(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return resp
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshTokenrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken },
          "Access Token refreshed Sucessfully !"
        )
      );
  } catch (error) {
    throw new ApiError(500,error?.message || "Invalid Refresh Token !");
  }
});
export { registerUser, loginUser, logOutUser, refreshAccessToken };
