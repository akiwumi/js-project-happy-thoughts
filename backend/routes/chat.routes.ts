import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getChats, createChat, searchUsers } from "../controllers/chat.controller.js";

const router = Router();

router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);
router.get("/search-users", authMiddleware, searchUsers);

export default router;
