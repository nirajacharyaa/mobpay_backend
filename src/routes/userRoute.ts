import { Router } from "express";
import {
  createUser,
  greetUser,
  signInUser,
} from "../controllers/userController.js";
const router = Router();

router
  .get("/", greetUser)
  .post("/create", createUser)
  .post("/signin", signInUser);

export default router;
