const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const http = require("http").Server(app); // Use the http module for the server
const io = require("socket.io")(http); // Initialize Socket.io with the http server
require("dotenv").config();
const Group = require("./models/groupModel");
const path = require("path");

app.use(cors());
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
    console.error("DB Connection Error:", err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve your static frontend files if needed
// app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
// });

// Socket.io connection handling
const onlineUsers = new Map();

io.on("connection", (socket) => {
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

const PORT = process.env.PORT || 3000; // Use the provided PORT or default to 3000

// Start the server
http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
