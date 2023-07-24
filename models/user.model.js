const mongoose = require("mongoose");
const connection = require("../config/db");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    apiKey: {
      type: String,
    },
  },
  { timestamps: true }
);

const userModel = connection.model("users", userSchema);
module.exports = userModel;
