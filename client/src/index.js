const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BarLink backend is live!");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected");

  socket.on("joinBar", (bar) => socket.join(bar));

  socket.on("sendMessage", (data) => {
    io.to(data.bar).emit("newMessage", data);
  });

  socket.on("typing", ({ name, bar }) => {
    socket.to(bar).emit("userTyping", name);
  });

  socket.on("stopTyping", ({ name, bar }) => {
    socket.to(bar).emit("userStopTyping", name);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
