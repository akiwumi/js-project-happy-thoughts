import { Schema, model } from "mongoose";
import type { UserProps } from "../types.js";

const userSchema = new Schema<UserProps>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        type: String,
        default: "",
    },
});

//const User = model<UserProps>("User", userSchema);

export default model<UserProps>("User", userSchema);