import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import os from "os";
const healthcheck=asyncHandler(async(req,resp)=>{
    // This would provide the good snapshot of the server's current health and reosurce usage
    const healthInfo = {
        status: "OK",
        timestamp: new Date().toISOString(), // records the current server time in ISO format
        uptime: process.uptime(), // shows how long the server has been running since the last restart
        server: os.hostname(), // identifies the server name helpful for load balanced setups
        load: os.loadavg(), // returns the server load average over the past 1,5,15 minutes,useful in Linux-based environments
        memory: {
            free: os.freemem(),
            total: os.totalmem(),
        },
    };
    return resp.status(200).json(new ApiResponse(200,healthInfo,"Health check successfull !"))
})
export {healthcheck};