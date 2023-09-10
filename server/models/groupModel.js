// groupModel.js

const mongoose = require("mongoose");
const GroupSchema = mongoose.Schema({
  name: {
    type: String,
    default:"Group"
  }
});

module.exports = mongoose.model("Group", GroupSchema);
