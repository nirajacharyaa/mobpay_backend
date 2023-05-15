import { Router } from "express";
import {
  createMerchant,
  getMerchants,
} from "../controllers/merchantController.js";

const router = Router();

router.post("/create", createMerchant).get("/", getMerchants);

export default router;
