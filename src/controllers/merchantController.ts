import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const createMerchant = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = jwt.verify(
      req.headers["x-access-token"] as string,
      process.env.JWT_SECRET as string
    ) as { id: string };
    const { name } = req.body;

    const applicant = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (applicant?.isMerchant) {
      res
        .status(400)
        .json({ success: false, message: "Merchant already exists" });
    } else {
      const merchant = await prisma.merchant.create({
        data: {
          name,
          User: {
            connect: {
              id: userId,
            },
          },
        },
      });

      if (merchant) {
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isMerchant: true,
          },
        });
        res.status(200).json({ success: true, merchant });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Merchant cannot be created" });
      }
    }
  }
);

export const getMerchants = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const merchants = await prisma.merchant.findMany();
    res.status(200).json({ success: true, merchants });
  }
);
