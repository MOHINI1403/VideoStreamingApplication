import { asyncHandler } from "../utils/asyncHandler.js";
const registerUser=asyncHandler(async (req,resp)=>{

    resp.status(200).json({
        message:"OK"
    });
});
export {registerUser};