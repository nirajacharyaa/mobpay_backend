import express, { Request, Response, Express } from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import userRoutes from "./src/routes/userRoute.js";
import merchantRoutes from "./src/routes/merchantRoute.js";
import productRoutes from "./src/routes/productRoutes.js";
import auth from "./src/middlewares/authMiddleware.js";

const app: Express = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cors());

// routes middlewares
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/merchant", auth, merchantRoutes);
app.use("/api/v1/product", productRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

app.listen(8000, () => {
  console.log("Listening in the port");
});
