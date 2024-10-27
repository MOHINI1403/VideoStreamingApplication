import mongoose,{mongo, Schema} from "mongoose";
const playlistsSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    videos:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});
export const Playlist=mongoose.model("Playlist",playlistsSchema);