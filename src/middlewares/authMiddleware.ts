import { NextFunction, Request, Response } from "express";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
const auth = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res
      .status(400)
      .json({ success: false, msg: "token required for authentication" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.body.user = decoded;
  } catch (err) {
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
  return next();
};

export default auth;
