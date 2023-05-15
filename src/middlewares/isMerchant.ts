import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const isMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = jwt.verify(
    req.headers["x-access-token"] as string,
    process.env.JWT_SECRET as string
  ) as { id: string };

  if (id) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user) {
      if (user.isMerchant) {
        next();
      } else {
        res.status(400).json({ success: false, message: "Not a merchant" });
      }
    } else {
      res.status(400).json({ success: false, message: "User not found" });
    }
  }
};

export default isMerchant;
