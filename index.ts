import express, { Request, Response, Express } from "express";
import cors from "cors";
import userRoutes from "./src/routes/userRoute.js";
const app: Express = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes middlewares
app.use("/api/v1/user", userRoutes);


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

app.listen(8000, () => {
  console.log("Listening in the port");
});
