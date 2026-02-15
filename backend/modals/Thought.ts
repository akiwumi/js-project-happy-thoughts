import { Schema, model } from "mongoose";
import type { ThoughtProps } from "../types.js";

const thoughtSchema = new Schema<ThoughtProps>({
    message: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 140,
        trim: true,
    },
    hearts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model<ThoughtProps>("Thought", thoughtSchema);
