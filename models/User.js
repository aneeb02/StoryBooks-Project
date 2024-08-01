const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  googleID: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fName: {
    type: String,
    required: true
  },
  lName: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("User", userSchema)