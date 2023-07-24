const mongoose = require("mongoose");

const dbName = "s3Cloud";
const connection = mongoose
  .createConnection(`mongodb://127.0.0.1:27017/${dbName}`)
  .on("open", () => {
    console.log("mongodb connection establised");
  })
  .on("error", () => {
    console.log("mongodb connection emit error");
  });

module.exports = connection;
