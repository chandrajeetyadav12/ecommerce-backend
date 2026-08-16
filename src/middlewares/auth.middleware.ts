import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest
  extends Request {
  user?: any;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookieToken = req.cookies?.cookietoken;
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error,
    });
  }
};