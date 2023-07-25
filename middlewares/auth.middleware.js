const userModel = require("../models/user.model");

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const { apiKey } = req.query;
    if (!apiKey) {
      return res.json({ error: { status: 404, msg: "apiKey is mandatory" } });
    }
    const user = await userModel.findOne({ apiKey });
    if (!user) {
      return res.json({ error: { status: 404, msg: "User not found" } });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
};

module.exports = authMiddleware;
