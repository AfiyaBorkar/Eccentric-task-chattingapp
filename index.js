const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const Group = require("./models/groupModel")
const path = require("path")




app.use(cors());
app.use(express.json());



// app.use(express.static(path.resolve(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
// });




mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("DB Connection Successful");

    // Check if there are any documents in the Group collection
    const count = await Group.countDocuments();

    if (count === 0) {
      // Create a default collection if no documents exist
      const allUsersGroup = await Group.create({});
      await allUsersGroup.save();
    }
  })
  .catch((err) => {
    console.log(err.message);
  });


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // socket.on("send-msg", (data) => {
  //   const sendUserSocket = onlineUsers.get(data.to);
  //   if (sendUserSocket) {
  //     socket.to(sendUserSocket).emit("msg-recieve", data.msg);
  //   }
  // });
  socket.on("send-msg", (data) => {
    console.log("🚀 ~ file: index.js:68 ~ socket.on ~ data:", data)

   

    console.log(onlineUsers)
    if(data.type=="group")
    {
        // Broadcast the message to all online users
        onlineUsers.forEach((userSocket) => {
          socket.to(userSocket).emit("msg-recieve", data);
        });
    }
    else
    {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    }

  });

  

});
