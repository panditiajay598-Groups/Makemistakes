import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Auth API Routes
app.use("/api/auth", authRoutes);

export default app;
