import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import os from "os";
const healthcheck=asyncHandler(async(req,resp)=>{
    const healthInfo = {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        server: os.hostname(),
        load: os.loadavg(),
        memory: {
            free: os.freemem(),
            total: os.totalmem(),
        },
    };
    return resp.status(200).json(new ApiResponse(200,healthInfo,"Health check successfull !"))
})
export {healthcheck};