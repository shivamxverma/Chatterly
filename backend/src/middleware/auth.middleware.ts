import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv'
dotenv.config();

interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  // Add other fields as needed
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({ status: 401, message: "UnAuthorized" });
  }
  const token = authHeader.split(" ")[1];

  //   * Verify the JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ status: 500, message: "JWT secret not configured" });
  }
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err)
      return res.status(401).json({ status: 401, message: "UnAuthorized" });
    req.user = user as AuthUser;
    next();
  });
};

export default authMiddleware;