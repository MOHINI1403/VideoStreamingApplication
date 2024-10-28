import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // This provides the entire statistics of the channel : total videos, total subscribers, and total likes on videos
    const channelId=req.user._id;
    // Step-1 : Total videos uploaded on the channel : i.e counting documents whose owner in videos is this person with channelId
    const totalVideos=await Video.countDocuments({owner:new mongoose.Types.ObjectId(channelId)});
    //STEP-2: Total subscribers for the channel 
    const totalSubscribers=await Subscription.countDocuments({channel:new mongoose.Types.ObjectId(channelId)});
    //STEP-3: Total Likes accross all the videos from the channel 
    const totalLikes=await Like.countDocuments({video:{$in:await Video.find({owner:new mongoose.Types.ObjectId(channelId)}).select('_id')}});

    // Response:
    res.status(200).json(
        new ApiResponse(200,{totalVideos,totalLikes,totalSubscribers},"Channel statistics retrieved successfully !")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId=req.user._id;
    const {page=1,limit=10}=req.query;
    const videos=await Video.find({owner:req.user})
        .sort({createdAt:-1})
        .skip((page=1)*limit)
        .limit(parseInt(limit))
        .select("title description videoFile thumbnail views createdAt");

    if(!videos.length){
        throw new ApiError(400,"No videos found for this channel")
    }
    // Response
    res.status(200).json( new ApiResponse(200,videos,"Channel videos retrieved successfully !"))
})

export {
    getChannelStats, 
    getChannelVideos
    }