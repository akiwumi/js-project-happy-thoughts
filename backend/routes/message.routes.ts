import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getMessages, sendMessage, editMessage, deleteMessage, markAsSeen } from "../controllers/message.controller.js";

const router = Router();

router.get("/:chatId", authMiddleware, getMessages);
router.post("/", authMiddleware, sendMessage);
router.patch("/:messageId", authMiddleware, editMessage);
router.delete("/:messageId", authMiddleware, deleteMessage);
router.patch("/:messageId/seen", authMiddleware, markAsSeen);

export default router;
