import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_CONNECTION_URL}/${DB_NAME}`
    );

    console.log(
      `\n Mongo DB Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Mongo DB Connection Error :", error);
    process.exit(1);
  }
};
export default connectDB;
