import type { Request, Response } from "express";
import Thought from "../modals/Thought.js";

// GET /thoughts
export const getThoughts = async (req: Request, res: Response) => {
    try {
        const thoughts = await Thought.find()
            .sort({ createdAt: "desc" })
            .limit(20)
            .exec();
        res.json(thoughts);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /thoughts
export const createThought = async (req: Request, res: Response) => {
    const { message } = req.body;
    try {
        const thought = new Thought({ message });
        await thought.save();
        res.status(201).json(thought);
    } catch (error: any) {
        res.status(400).json({ message: "Could not save thought", errors: error.errors });
    }
};

// POST /thoughts/:thoughtId/like
export const likeThought = async (req: Request, res: Response) => {
    const { thoughtId } = req.params;
    try {
        const thought = await Thought.findByIdAndUpdate(
            thoughtId,
            { $inc: { hearts: 1 } },
            { new: true }
        );
        if (!thought) {
            res.status(404).json({ message: "Thought not found" });
            return;
        }
        res.json(thought);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
