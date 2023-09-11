const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const Group = require("./models/groupModel");
app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(cors()); // Use the CORS middleware
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("DB Connection Successful");

    const count = await Group.countDocuments();

    if (count === 0) {
      const allUsersGroup = await Group.create({});
      await allUsersGroup.save();
    }
  })
  .catch((err) => {
    console.log(err.message);
  });

  app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build/index.html'));
  });
  


const server = app.listen(process.env.PORT || 5000, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "*", // Allow all origins to access your server
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log("Received message:", data);

    if (data.type === "group") {
      // Broadcast the message to all online users
      onlineUsers.forEach((userSocket) => {
        socket.to(userSocket).emit("msg-recieve", data);
      });
    } else {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    }
  });
});
