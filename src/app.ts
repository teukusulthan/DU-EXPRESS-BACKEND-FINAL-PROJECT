import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

import authRoute from "./routes/auth";

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.use("/api/v1/auth", authRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
