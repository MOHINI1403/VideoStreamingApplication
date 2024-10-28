import mongoose, {isValidObjectId} from "mongoose"
import { Like } from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// helper fucntion to toggle the like ont eh resource :(video,tweet or comment)
const toggleLike=async(resourceId,resourceField,userId)=>{
    try{
        const existingLike=await Like.findOne({
            [resourceField]:new mongoose.Types.ObjectId(resourceId),
            likedBy:new mongoose.Types.ObjectId(userId),
        });
        if(existingLike){
            await Like.findByIdAndDelete({
                [resourceField]:new mongoose.Types.ObjectId(resourceId),
                likedBy:new mongoose.Types.ObjectId(userId),
            });
            return {liked:false};
        }
        else{
            const newLike=await Like.create({
                [resourceField]:new mongoose.Types.ObjectId(resourceId),
                likedBy:new mongoose.Types.ObjectId(userId),
            });
            return {liked:true,like:newLike};
        }
    }
    catch(error){
        throw new ApiError(error.status,error.message);
    }
};
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId=req.user._id;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video Id is not valid !");
    }
    const result=await toggleLike(videoId,"video",userId);
    const message=result.liked? "Video Liked" : "Video Unliked";
    return res.status(200).json(new ApiResponse(200,result.like,message));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId=req.user._id;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment Id is not Valid !");
    }
    const result=await toggleLike(commentId,"comment",userId);
    const message=result.liked? "Comment Liked " : "Comment Unliked";
    return res.status(200).json(new ApiResponse(200,result.like,message));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet Id is not Valid !");
    }
    const userId=req.user._id;
    const result=await toggleLike(tweetId,"tweet",userId);
    const message=result.liked? "Tweet Liked " : "Tweet Unliked ";
    return res.status(200).json(new ApiResponse(200,result.like,message));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId=req.user._id;
    const likedVideos=await Like.find({likedBy:new mongoose.Types.ObjectId(userId),video:{$exists:true}})
        .populate("video")
        .select("video createdAt");

    return res.status(200).json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully !"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}