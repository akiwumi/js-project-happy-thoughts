import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            const msg = "Environment variable MONGO_URI is not set. Create a .env in backend or set MONGO_URI before starting the server.";
            console.error(msg);
            throw new Error(msg);
        }

        await mongoose.connect(mongoUri);
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw error;
    }
};

export default connectDB;
