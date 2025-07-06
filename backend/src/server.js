import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js"; // 👈 import DB connect
import { app } from "./app.js"; // 👈 named import

dotenv.config();

const PORT = process.env.PORT || 4000;

// 1. Connect DB first
connectDB()
  .then(() => {
    // 2. Create HTTP server from express app
    const server = http.createServer(app);

    // 3. Setup Socket.IO server
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", // frontend
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // 4. Store io instance on app for use in controllers
    //app.set("io", io);
    global.io = io; // Make it globally accessible

    // 5. Setup socket connection handler
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

    // 6. Start server manually
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB:", err);
  });
