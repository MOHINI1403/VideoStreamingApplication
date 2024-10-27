import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const getAllVideos=asyncHandler(async(req,resp)=>{
    const {page=1,limit=10,sortBy="createdAt",sortOrder=-1}=req.query;
    const options={
        page:parseInt(page),
        limit:parseInt(limit),
        sort:{[sortBy]:sortOrder},
    };
    const vidoes=await Video.aggregatePaginate(Video.aggregate([]),options);
    resp.status(200).json(
        new ApiResponse(200,vidoes,"Video Fetched Successfully !!")
    )

});
const publishVideo=asyncHandler(async(req,resp)=>{
    const {title,description}=req.body;
    const owner=req.user; // the User could be fetched from the one sent in JWT token
    if([title,description].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are Required !");
    }
    const existedVideo=await Video.findOne({title,owner}); // Query to find the file having both the title and the User
    if(existedVideo){
        throw new ApiError(409,"Video with this Title Already Exists !!");
    };
    const videoFileLocalPath=req.files?.videoFile[0].path;
    const thumbnailLocalPath=req.files?.thumbnail[0].path;
    if(!videoFileLocalPath){
        throw new ApiError(400,"Video File is Required !");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is Required !");
    }
    // Upload on Cloudinary
    const videoFile=await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
    if(!videoFile){
        throw new ApiError(400,"Error in uploading the video file on Cloudinary");
    }
    if(!thumbnail){
        throw new ApiError(400,"Error in Uploading the thumbnail on Cloudinary");
    }
    const duration=videoFile.duration;
    const video=await Video.create({
        title,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        description,
        owner,
        duration,

    })
    if(!video){
        throw new ApiError(500,"Something went wrong while Publishing the video ");
    }
    return resp.status(201).json(
        new ApiResponse(200,video,"Video Published Successfully !")
    )

});
const getVideoById = asyncHandler(async (req, resp) => {
    const { videoId } = req.params;
    console.log(videoId);
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video=await Video.findById(videoId).populate("owner","userName email avatar coverImage");
    if(!video){
        throw new ApiError(404,"Video not Found ")
    }
    resp.status(200).json(
        new ApiResponse(200,video,"Video with desired ID Fetched successfully !")
    )  
})

const updateVideo = asyncHandler(async (req, resp) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video ID");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(req.file){
        const thumbnailLocalPath=req.file.path;
        if(!thumbnailLocalPath){
            throw new ApiError(400,"Error while the file was getting uploaded in Local Storage !")
        }
        const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail){
            throw new ApiError(400,"Error in Uploading the thumbnail on Cloudinary");
        }
        video.thumbnail=thumbnail.url;
    }
    if(title){
        video.title=title;
    }
    if(description){
        video.description=description;
    }
    await video.save({validateBeforeSave:false})
    return resp.status(200).json(
        new ApiResponse(200,video,"Desired Updates are made to the videoFile successfully !")
    )

});
const deleteVideo = asyncHandler(async (req, resp) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video=await Video.findByIdAndDelete(videoId);
    if(!video){
        throw new ApiError(404,"Video not found !");
    }
    return resp.status(200).json(
        new ApiResponse(200,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, resp) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found !");
    }
    video.isPublished=!video.isPublished;
    await video.save({validateBeforeSave:false});
    return resp.status(200).json(
        new ApiResponse(200,"Toggled the isPublished Status of the file ! ")
    )
})

export {getAllVideos,publishVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus}; 