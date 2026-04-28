import { Schema, model } from "mongoose";
import type { ConversationProps } from "../types.js";

const chatSchema = new Schema<ConversationProps>(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            default: "direct",
        },
        name: {
            type: String,
            default: "",
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        avatar: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default model<ConversationProps>("Chat", chatSchema);
