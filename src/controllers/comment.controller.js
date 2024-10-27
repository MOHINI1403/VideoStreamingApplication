import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    const options={
        page:parseInt(page),
        limit:parseInt(limit),
    };
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found with this videoId");
    }
    const comments=await Comment.aggregatePaginate(
        Comment.aggregate([
            {$match:{video:new mongoose.Types.ObjectId(videoId)}},
            {$sort:{createdAt:-1}},
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                },
            },
            {$unwind:"$owner"},
            {
                $project:{
                    content:1,
                    createdAt:1,
                    owner:{
                        userName:1,
                        avatar:1,
                    },
                },
            },
        ]),
        options
    );
    return res.status(200).json(
        new ApiResponse(200,comments,"Comments Fetched Successfully !")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body;
    const owner=req.user;
    const {videoId}=req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found with this VideoId !");
    }
    const comment=await Comment.create({
        content:content,
        owner:owner,
        video:video
    });
    if(!comment){
        throw new ApiError(500,"Something went wrong while adding the comment !");
    }
    return res.status(201).json(
        new ApiResponse(200,comment,"Comment is addded successfully for the desired video !")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;
    const {content}=req.body;
    const owner=req.user;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
    };
    const comment=await Comment.findOne({_id:commentId,owner});
    if(!comment){
        throw new ApiError(404,"Comment not found or you donnot have the permission to update this comment !");
    }
    comment.content=content;
    await comment.save({validateBeforeSave:false});
    res.status(200).json(
        new ApiResponse(200,comment,"Comment updated Successfully !!")
    )
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    const owner=req.user;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"CommentId doesn't exist or is not valid !!");
    }
    const comment=await Comment.findOneAndDelete({_id:commentId,owner:owner});
    if(!comment){
        throw new ApiError(404,"Comment not found or you don't have the permissions to delete the comment !")
    }
    res.status(200).json(
        new ApiResponse(200,"Comment Deleted Successfully !")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }