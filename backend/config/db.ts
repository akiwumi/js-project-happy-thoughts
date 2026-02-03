import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw error;
    }
};

export default connectDB;
