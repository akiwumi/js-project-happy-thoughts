import type { UserProps } from "../types.js";
import jwt from "jsonwebtoken";

export const generateToken = (user: UserProps) => {
    const payload = {
        userId: user._id,
        name: user.name,
        email: user.email,
    }
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "30d" });
};