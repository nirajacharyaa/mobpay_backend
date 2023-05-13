import { Router } from "express";
import {
  createUser,
  greetUser,
  sendMoney,
  signInUser,
} from "../controllers/userController.js";
const router = Router();

router
  .get("/", greetUser)
  .post("/create", createUser)
  .post("/signin", signInUser)
  .post("/sendmoney", sendMoney);

export default router;
