import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    const server = http.createServer(app);

    let io = null;

    // Enable Socket.IO only in development
    if (process.env.NODE_ENV !== "production") {
      io = new Server(server, {
        cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true,
        },
      });

      global.io = io;

      io.on("connection", (socket) => {
        console.log("📡 New client connected:", socket.id);

        socket.on("join", (userId) => {
          console.log("✅ Joining socket room:", userId);
          socket.join(userId);
        });

        socket.on("disconnect", () => {
          console.log("❌ Client disconnected:", socket.id);
        });
      });

      console.log("🟢 Socket.IO ENABLED (Development)");
    } else {
      console.log("🟡 Socket.IO DISABLED in production");
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB:", err);
  });
