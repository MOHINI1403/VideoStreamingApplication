import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const owner=req.user;
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }
    console.log(name);
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:owner,
        videos: []
    });
    if(!playlist){
        throw new ApiError(400,"Error while creating the Playlist");
    }

    return res.status(201).json(new ApiResponse(200,playlist,"Playlist Created Succeefully !"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"The user Id is not valid !");
    }
    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(404,"No user with this userId found !");
    }
    const playlists = await Playlist.find({ owner: user }).populate("videos", "title duration");
    if(!playlists){
        throw new ApiError(404,"Unable to find the Playlist with this UserId");
    };

    return res.status(200).json(new ApiResponse(200,playlists,"Playlist of the User found Successfully !"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    const playlist = await Playlist.findById(playlistId).populate("videos", "title duration");
    if(!playlist){
        throw new ApiError(500,"Something went wrong while trying to find the playlist with the given Id");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Fetched Succeesfully !"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save({validateBeforeSave:false});
    }
    return res.status(200).json(new ApiResponse(200,"Video Added Successfully to the Playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
    await playlist.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,"Video removed from the Playlist Successfully !"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(200,"Playlist Deleted Successfully");
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;
    await playlist.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,playlist,"Updates to the playlist are made succeefully !"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}