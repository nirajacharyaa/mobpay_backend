import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import "dotenv/config";
import { create } from "domain";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const file = req.files?.image as any;
    const { name, price } = req.body;
    const { id: userId } = jwt.verify(
      req.headers["x-access-token"] as string,
      process.env.JWT_SECRET as string
    ) as { id: string };

    if (!name || !price) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    } else {
      if (file) {
        cloudinary.uploader.upload(
          file.tempFilePath,
          async (err: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (err) {
              return res
                .status(500)
                .json({ success: false, message: err.message });
            } else {
              const user = await prisma.user.findUnique({
                where: {
                  id: userId,
                },
              });

              const product = await prisma.product.create({
                data: {
                  name,
                  price: parseFloat(price),
                  image: result.secure_url,
                  merchantId: user?.merchantId,
                },
              });
              res.status(200).json({
                success: true,
                message: "product successfully created",
                product,
              });
            }
          }
        );
      }
    }
  }
);

export const getProducts = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { merchantId } = req.params;
    if (merchantId) {
      const products = await prisma.product.findMany({
        where: {
          merchantId,
        },
      });
      if (products) {
        res.status(200).json({ success: true, products });
      } else {
        res.status(404).json({ success: false, message: "No products found" });
      }
    } else {
      res.status(400).json({ success: false, message: "Merchant not found" });
    }
  }
);
