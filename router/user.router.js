const router = require("express").Router();
const userModel = require("../models/user.model");
const crypto = require("crypto-js");
const authMiddleware = require("../middlewares/auth.middleware");

// Register a user and generate apiKey
router.post("/register", async (req, res) => {
  try {
    const { name } = req.body;
    const uniqueStr = name + new Date().getTime();
    const apiKey = crypto.SHA256(uniqueStr).toString().slice(0, 20);

    const user = await userModel.create({ name, apiKey });

    return res.json({
      success: { status: 200, msg: "User created successfully", data: user },
    });
  } catch (err) {
    return res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
});

// Login User
router.post("/login", authMiddleware, async (req, res) => {
  try {
    if (req.user) {
      return res.json({
        success: { status: 200, msg: "Login Successfully", data: req.user },
      });
    }
  } catch (err) {
    return res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
});

module.exports = router;
