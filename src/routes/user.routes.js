import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUsersWatchHistory,
  loginUser,
  logOutUser,
  registerUser,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
    },
    {
      name: "coverImage",
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
// Secured Routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

//getting the information -routes
router.route("/current-user").get(verifyJWT, getCurrentUser);

//update routes
router.route("/update-accountDetails").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);
router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watchHistory").get(verifyJWT,getUsersWatchHistory);

export default router;
