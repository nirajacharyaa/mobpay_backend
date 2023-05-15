import { prisma } from "./prisma.js";
import { Request } from "express";
import jwt from "jsonwebtoken";
export const findUser = async (req: Request) => {
  const { id: userId } = jwt.verify(
    req.headers["x-access-token"] as string,
    process.env.JWT_SECRET as string
  ) as { id: string };
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {},
  });
};
