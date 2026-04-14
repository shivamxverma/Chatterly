import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import * as yup from 'yup';
dotenv.config();

interface AuthUser {
  id: string;
  username?: string;
  email?: string;
}

export const validate = (
  location: 'query' | 'body' | 'params',
  schema: yup.ObjectSchema<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      type RequestLocation = 'query' | 'body' | 'params';

      let _location: RequestLocation;

      switch (location) {
        case 'query':
          _location = 'query';
          break;
        case 'body':
          _location = 'body';
          break;
        case 'params':
          _location = 'params';
          break;
        default:
          throw new Error(`Invalid location: ${location}`);
      }

      req[_location] = await schema.validate(req[_location], {
        abortEarly: false,
      });

      next();
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        const errorMessages = error.errors.join(', ');
        return res.status(400).json({ error: errorMessages });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'An unknown error occurred' });
    }
  };
};

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
    (req as any).user = user as AuthUser;
    next();
  });
};

export default authMiddleware;