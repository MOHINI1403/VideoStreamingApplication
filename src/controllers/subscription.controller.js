import mongoose,{isValidObjectId, mongo} from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription=asyncHandler(async(req,resp)=>{
    const {channelId}=req.params;
    const subscriberId=req.user._id; // Assuming the subscriber is the logged-in user
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id");
    }
    const channelExists=await User.findById(channelId); // the channel is the user only so find weather there is a user with this Id or not
    if(!channelExists){
        throw new ApiError(404,"Channel not found !");
    }
    const existingSubscription=await Subscription.findOne({
        subscriber:new mongoose.Types.ObjectId(subscriberId),
        channel:new mongoose.Types.ObjectId(channelId)
    });
    if(existingSubscription){
        await Subscription.findOneAndDelete({
            subscriber:new mongoose.Types.ObjectId(subscriberId),
            channel:new mongoose.Types.ObjectId(channelId)
        })
        return resp.status(200).json(new ApiResponse(200,null,"Unsubscribed Succeeded"))
    }
    else{
        const newSubscription=await Subscription.create({
            subscriber:new mongoose.Types.ObjectId(subscriberId),
            channel:new mongoose.Types.ObjectId(channelId)
        });
        return resp.status(201).json(new ApiResponse(201,newSubscription,"Subscriptions Created Successfully !"));
    }
});
// Get all the subscriber for the channel : We need to look into all the documents where the channel is the channelId
const getUserChannelSubscribers=asyncHandler(async(req,resp)=>{
    const {channelId}=req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Channel Id not Valid !");
    }
    const subscribers=await Subscription.find({channel:new mongoose.Types.ObjectId(channelId)})
        .populate("subscriber","userName avatar")
        .select("subscriber createdAt");
    if(!subscribers.length){
        throw new ApiError(404,"No subscribers found for this channel !");
    }
    return resp.status(200).json(new ApiResponse(200,subscribers,"Sbscribers retrieved succesfully for the given Channel !"));
});
//This returns all channel List that the user has subscribed to : looking into all the documents where the subscriber is subscriberId
const getSubscribedChannels=asyncHandler(async(req,resp)=>{
    const {subscriberId}=req.params;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Subscriber Id is not valid !");
    }
    const subscriptions=await Subscription.find({subscriber:new mongoose.Types.ObjectId(subscriberId)})
        .populate("channel","userName avatar")
        .select("channel createdAt");
    if(!subscriptions.length){
        throw new ApiError(404,"No subscriptions foudn for this user !");
    }
    return resp.status(200).json(new ApiResponse(200,subscriptions,"Channel List of all the subscriptions for User Fetched successfully !"));
})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}