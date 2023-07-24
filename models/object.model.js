const mongoose = require("mongoose");
const connection = require("../config/db");
const { Schema } = mongoose;
const userModel = require("./user.model");

const objectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: userModel.modelName,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  { timestamps: true }
);

const objectModel = connection.model("objects", objectSchema);
module.exports = objectModel;
