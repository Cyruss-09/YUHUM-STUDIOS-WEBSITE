const jwt = require("jsonwebtoken");

// Verifies the Bearer token and attaches decoded payload to req.user.
function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  // Clean token string from extra whitespace or accidental quotes
  let token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize user ID property across controllers (id or userId)
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Use after verifyToken — rejects anyone whose role isn't 'admin'.
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };