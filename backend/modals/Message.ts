import { Schema, model, Document, Types } from "mongoose";

export interface MessageProps extends Document {
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    senderName: string;
    text: string;
    seen: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<MessageProps>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        seen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default model<MessageProps>("Message", messageSchema);
