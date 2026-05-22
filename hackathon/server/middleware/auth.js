const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = auth.split(" ")[1];
    
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your-jwt-secret-key-here') {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = { authenticate };
