import { asyncHandler } from "../utils/asyncHandler";

export const verifyJWT=asyncHandler(async(req,resp,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
})