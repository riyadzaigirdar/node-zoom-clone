const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { v4: uId } = require("uuid");

// app setup
const app = express();
const server = http.createServer(app);
const io = socket(server);

// middleware setup
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uId()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("we have a new connection");
  socket.on("joinroom", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(3000, () => console.log("server running on port 3000"));
