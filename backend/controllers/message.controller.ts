import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import Message from "../modals/Message.js";
import Chat from "../modals/Chat.js";
import { ensureDefaultChatForUser } from "./chat.controller.js";

// Get all messages for a chat
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    const { chatId } = req.params;
    
    const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;

    if (!chatIdStr) {
        res.status(400).json({ message: "chatId is required" });
        return;
    }

    try {
        // Verify user is a participant
        const chat = await Chat.findOne({
            _id: new Types.ObjectId(chatIdStr),
            participants: req.user!.userId,
        });

        if (!chat) {
            res.status(403).json({ message: "Not a participant of this chat" });
            return;
        }

        const messages = await Message.find({ chatId: new Types.ObjectId(Array.isArray(chatId) ? chatId[0] : chatId) }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { chatId, text } = req.body;

    if (!text) {
        res.status(400).json({ message: "text is required" });
        return;
    }

    try {
        const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;
        const chat = chatIdStr
            ? await Chat.findOne({
                _id: new Types.ObjectId(chatIdStr),
                participants: req.user!.userId,
            })
            : await ensureDefaultChatForUser(req.user!.userId);

        if (!chat) {
            res.status(403).json({ message: "Not a participant of this chat" });
            return;
        }

        const message = new Message({
            chatId: chat._id,
            sender: req.user!.userId,
            senderName: req.user!.name,
            text,
        });

        await message.save();

        // Update last message on chat
        chat.lastMessage = message._id;
        await chat.save();

        // Emit socket event to other participants
        const io = req.app.get("io");
        if (io) {
            chat.participants.forEach((participantId: any) => {
                if (participantId.toString() !== req.user!.userId) {
                    io.to(participantId.toString()).emit("message:received", message);
                }
            });
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to send message" });
    }
};

// Mark a message as seen
// Edit a message
export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text) {
        res.status(400).json({ message: "Text is required" });
        return;
    }

    if (!messageId) {
        res.status(400).json({ message: "messageId is required" });
        return;
    }

    try {
        const message = await Message.findById(new Types.ObjectId(messageId as string));

        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user!.userId) {
            res.status(403).json({ message: "Only the sender can edit this message" });
            return;
        }

        message.text = text;
        await message.save();

        // Emit socket event to all chat participants
        const chat = await Chat.findById(message.chatId);
        const io = req.app.get("io");
        if (io && chat) {
            chat.participants.forEach((participantId: any) => {
                io.to(participantId.toString()).emit("message:edited", {
                    messageId: message._id,
                    text: message.text,
                    chatId: message.chatId,
                });
            });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to edit message" });
    }
};

// Delete a message
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;

    if (!messageId) {
        res.status(400).json({ message: "messageId is required" });
        return;
    }

    try {
        const message = await Message.findById(new Types.ObjectId(messageId as string));

        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user!.userId) {
            res.status(403).json({ message: "Only the sender can delete this message" });
            return;
        }

        await Message.findByIdAndDelete(new Types.ObjectId(messageId as string));

        // Emit socket event to all chat participants
        const chat = await Chat.findById(message.chatId);
        const io = req.app.get("io");
        if (io && chat) {
            chat.participants.forEach((participantId: any) => {
                io.to(participantId.toString()).emit("message:deleted", {
                    messageId: message._id,
                    chatId: message.chatId,
                });
            });
        }

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete message" });
    }
};

// Mark a message as seen
export const markAsSeen = async (req: AuthRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    
    const messageIdStr = Array.isArray(messageId) ? messageId[0] : messageId;

    if (!messageIdStr) {
        res.status(400).json({ message: "messageId is required" });
        return;
    }

    try {
        const message = await Message.findByIdAndUpdate(
            new Types.ObjectId(messageIdStr),
            { seen: true },
            { new: true }
        );

        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(message.sender.toString()).emit("message:seen", {
                messageId: message._id,
            });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to mark message as seen" });
    }
};
