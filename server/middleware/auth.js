const jwt = require("jsonwebtoken");

// Verifies the Bearer token and attaches { id, role } to req.user.
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Use after verifyToken — rejects anyone whose role isn't 'admin'.
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access only." });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };