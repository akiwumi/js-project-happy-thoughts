import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Chat from "../modals/Chat.js";
import User from "../modals/User.js";

const DEFAULT_GROUP_CHAT_NAME = "Community";

export const ensureDefaultChatForUser = async (userId: string) => {
    let defaultChat = await Chat.findOne({
        type: "group",
        name: DEFAULT_GROUP_CHAT_NAME,
    });

    if (!defaultChat) {
        defaultChat = await Chat.create({
            type: "group",
            name: DEFAULT_GROUP_CHAT_NAME,
            participants: [userId],
            createdBy: userId,
        });
    } else if (!defaultChat.participants.some((participantId) => participantId.toString() === userId)) {
        defaultChat.participants.push(userId as any);
        await defaultChat.save();
    }

    return defaultChat;
};

// Get all chats for the authenticated user
export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await ensureDefaultChatForUser(req.user!.userId);

        const chats = await Chat.find({ participants: req.user!.userId })
            .populate("participants", "name email avatar")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chats" });
    }
};

// Create a new direct chat (or return existing one)
export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.body;
    const currentUserId = req.user!.userId;

    if (!userId) {
        res.status(400).json({ message: "userId is required" });
        return;
    }

    try {
        // Check if a direct chat already exists between these two users
        const existingChat = await Chat.findOne({
            type: "direct",
            participants: { $all: [currentUserId, userId], $size: 2 },
        })
            .populate("participants", "name email avatar")
            .populate("lastMessage");

        if (existingChat) {
            res.json(existingChat);
            return;
        }

        // Validate target user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const chat = new Chat({
            type: "direct",
            participants: [currentUserId, userId],
            createdBy: currentUserId,
        });
        await chat.save();

        const populated = await Chat.findById(chat._id)
            .populate("participants", "name email avatar")
            .populate("lastMessage");

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: "Failed to create chat" });
    }
};

// Search users to start a new chat
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
        res.json([]);
        return;
    }

    try {
        const users = await User.find({
            _id: { $ne: req.user!.userId },
            $or: [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ],
        }).select("name email avatar");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to search users" });
    }
};
