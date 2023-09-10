const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Reference to the Group model
    },
    type: { type: String, default: "user" },
  
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
