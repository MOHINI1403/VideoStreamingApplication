import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const owner=req.user;
    const {content}=req.body;
    const tweet=await Tweet.create({
        content:content,
        owner:owner
    });
    if(!tweet){
        throw new ApiError(404,"Error while creating the tweet !");
    }
    return res.status(201).json(
        new ApiResponse(200,tweet,"Tweet Created Successfully !")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID.");
    }
    const user=req.user;
    if (!user) {
        throw new ApiError(404, "User not found.");
    }
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "userName avatar");
    return res.status(200).json(
        new ApiResponse(200,tweets,"User Tweets Fetched Successfully ! ")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const {content}=req.body;
    const owner=req.user;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet Id is not valid !");
    }
    const tweet=await Tweet.findOne({_id:tweetId,owner:owner});
    if(!tweet){
        throw new ApiError(404,"No tweet with this tweetId exits or you donnot have the permission to edit this tweet!");
    }
    tweet.content=content;
    await tweet.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,tweet,"Token updated Successfully !")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet Id is not valid !");
    }
    const owner=req.user;
    const tweet=await Tweet.findByIdAndDelete({_id:tweetId,owner:owner});
    if(!tweet){
        throw new ApiError(404,"Tweet not found or you don't have the permissions to delete the tweet !")
    }
    res.status(200).json(
        new ApiResponse(200,"Tweet Deleted Successfully !")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}