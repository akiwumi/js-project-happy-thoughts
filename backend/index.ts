import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, "");
const configuredFrontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

const allowedOrigins = new Set([
    "http://localhost:5173",
    ...configuredFrontendOrigins,
]);

const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true;

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.has(normalizedOrigin)) {
        return true;
    }

    // Vercel preview deployments use unique subdomains, so allow them when the
    // configured frontend is hosted on Vercel.
    const hasVercelFrontend = configuredFrontendOrigins.some((configuredOrigin) =>
        configuredOrigin.endsWith(".vercel.app")
    );

    return hasVercelFrontend && normalizedOrigin.endsWith(".vercel.app");
};

app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
        },
        credentials: true,
    },
});

// Make io accessible in route handlers
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Join a room named after the user's ID for targeted messaging
    if (userId) {
        socket.join(userId);
    }

    // Handle joining a chat room
    socket.on("chat:join", ({ chatId }) => {
        socket.join(`chat:${chatId}`);
        console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Handle typing indicator
    socket.on("user:typing", (data) => {
        socket.to(`chat:${data.chatId}`).emit("user:typing", data);
    });

    // Handle stopped typing
    socket.on("user:stopped-typing", (data) => {
        socket.to(`chat:${data.chatId}`).emit("user:stopped-typing", data);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
    });
});

connectDB()
    .then(() => {
        console.log("MongoDB connected");
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server due to database connection error", error
        );
    });
