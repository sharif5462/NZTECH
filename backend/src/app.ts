import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

const app: Application = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Root status probe
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    message: "HirePulse NZ Tech REST API Server is running",
    version: "1.0.0",
    docs: "/api/analytics",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

export default app;
