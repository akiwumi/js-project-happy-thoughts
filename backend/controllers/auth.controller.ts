import type { Request, Response } from "express";
import User from "../modals/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";

export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = generateToken(user);
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "User not found" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }
        const token = generateToken(user);
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};