import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema=new Schema({
    userName:{
        type:String,
        required:[true,'UserName is Required !'],
        unique:[true,'UserName should be unique !'],
        lowercase:[true,'UserName should be in lowercase'],
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:[true,'Email is Required'],
        unique:[true,'Email field should be unique'],
        lowercase:[true,'Email should be in lowercase'],
        trim:true,
    },
    fullName:{
        type:String,
        required:[true,'FullName is required !'],
        trim:true,
        index:true
    },
    avatar:{
        type:String, // cloudinary URL
        required:[true,'Avatar is required']
    },
    coverImage:{
        type:String, // cloudinary URL
        
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,'Password is Required']
    },
    refershToken:{
        type:String
    }

},{timestamps:true});

// We want the code to run only when the change in password field is made not everytime 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    try {
        // Hash the password before saving
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err); 
    }
})
// This portion checks the password 
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generarteAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generarterefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    )

}
export const User=mongoose.model("User",userSchema);