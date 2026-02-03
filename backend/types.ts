import { Document, Types } from "mongoose";

export interface UserProps extends Document {
    name?: string;
    email: string;
    password: string;
    createdAt: Date;
    avatar?: string;
}

export interface ConversationProps extends Document {
    _id: Types.ObjectId;
    type: "direct" | "group";
    name?: string;
    participants: Types.ObjectId[];
    lastMessage: Types.ObjectId;
    createdBy: Types.ObjectId;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
