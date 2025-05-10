const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../client/build")));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "server/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("✅ New client connected");

  socket.on("joinBar", (bar) => {
    socket.join(bar);
    console.log(`🔗 Joined bar: ${bar}`);
  });

  socket.on("sendMessage", (data) => {
    console.log(`📤 Message from ${data.name} at ${data.bar}:`, data.text);
    io.to(data.bar).emit("newMessage", data);
  });

  socket.on("sendImage", (data) => {
    console.log(`🖼️ Image from ${data.name} at ${data.bar}`);
    io.to(data.bar).emit("newImage", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Catch-all route for React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
