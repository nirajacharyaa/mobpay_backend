import { Router } from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/productControllers.js";
import isMerchant from "../middlewares/isMerchant.js";

const router = Router();

router
  .post("/create", isMerchant, createProduct)
  .get("/:merchantId", getProducts);
export default router;
