import { Router } from "express";
import { getThoughts, createThought, likeThought } from "../controllers/thought.controller.js";

const router = Router();

router.get("/", getThoughts);
router.post("/", createThought);
router.post("/:thoughtId/like", likeThought);

export default router;
