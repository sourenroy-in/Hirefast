import jwt from "jsonwebtoken";

// The token is made at login and sent with later requests.
export function loginNeeded(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Please log in first" });
  try {
    req.user = jwt.verify(token, process.env.TOKEN_KEY);
    next();
  } catch {
    res.status(401).json({ message: "Login expired. Please log in again" });
  }
}

export function roleNeeded(role) {
  return (req, res, next) => {
    if (req.user?.role !== role)
      return res
        .status(403)
        .json({ message: "This page is not for your account" });
    next();
  };
}
