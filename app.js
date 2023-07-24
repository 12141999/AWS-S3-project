const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./router/user.router");
const s3ApiRouter = require("./router/S3api.router");

const app = express();
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/", s3ApiRouter);

module.exports = app;
