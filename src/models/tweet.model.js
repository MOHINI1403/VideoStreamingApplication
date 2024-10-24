import mongoose,{mongo, Schema} from "mongoose";
const tweetsSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String
    }
},{timestamps:true});
export const Tweet=mongoose.model("Tweet",tweetsSchema);