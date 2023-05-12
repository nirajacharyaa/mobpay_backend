import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../lib/hashPassword.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

export const greetUser = (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
};

export const createUser = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { name, phone, email, password } = req.body;
    const hashedPassword = (await hashPassword(password)) as string;
    const user = await prisma.user.create({
      data: {
        name,
        phone: phone,
        email: email,
        hashedPassword: hashedPassword,
        isMerchant: true,
      },
    });
    res.send(user);
  }
);

export const signInUser = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        phone: phone,
      },
    });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (isMatch) {
        jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" },
          (err, token) => {
            if (err) {
              throw err;
            }
            res.send({
              token,
              user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
              },
            });
          }
        );
      } else {
        res.status(401).send({ message: "Invalid Credentials" });
      }
    }
  }
);
