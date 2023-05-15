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
            return res.send({
              token,
              user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
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

export const sendMoney = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { amount, receiverPhone, remark } = req.body;
    const { id: senderId } = jwt.verify(
      req.headers["x-access-token"] as string,
      process.env.JWT_SECRET as string
    ) as { id: string };
    const sender = await prisma.user.findUnique({
      where: {
        id: senderId,
      },
    });
    const receiver = await prisma.user.findUnique({
      where: {
        phone: receiverPhone,
      },
    });
    if (!receiver) {
      res.json({ message: "Receiver not found" });
    }
    if (sender && receiver) {
      if (sender.balance < amount) {
        res.json({ message: "Insufficient Balance" });
      } else {
        const updatedSender = await prisma.user.update({
          where: {
            id: senderId,
          },
          data: {
            balance: sender.balance - amount,
          },
        });
        const updatedReceiver = await prisma.user.update({
          where: {
            phone: receiverPhone,
          },
          data: {
            balance: receiver.balance + amount,
          },
        });
        const transaction = await prisma.transaction?.create({
          data: {
            amount: amount,
            remark: remark,
            sender: {
              connect: {
                id: senderId,
              },
            },
            receiver: {
              connect: {
                id: receiver.id,
              },
            },
          },
        });
        res.json({
          message: "Transaction Successful",
          sender: updatedSender.phone,
          receiver: {
            phone: updatedReceiver.phone,
            name: updatedReceiver.name,
          },
          transaction: transaction,
        });
      }
    }
  }
);
