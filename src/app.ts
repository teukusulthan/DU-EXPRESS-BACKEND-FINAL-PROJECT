import "express-async-errors";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.use("/api/v1/auth", authRoute);

app.use(errorHandler);

export default app;
