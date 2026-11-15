import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import jobRoutes from "./routes/jobs.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // Read JSON sent by React.

app.get("/api", (req, res) =>
  res.json({
    message: "HireFast API is running",
    databaseName: mongoose.connection.name || "hirefast",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not connected",
  }),
);
app.get("/api/health", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "MongoDB is not connected" });
  }
  res.json({ message: "API and database are ready" });
});
// Return a helpful message instead of waiting when MongoDB is stopped.
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "MongoDB is not connected. Start MongoDB and try again.",
    });
  }
  next();
});
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

app.use((error, req, res, next) => {
  console.error(error.message);
  const status = error.status || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  const message =
    error.code === "LIMIT_FILE_SIZE"
      ? "Resume must be 5 MB or smaller"
      : error.status === 400
        ? error.message
        : "The server could not finish that request";
  res.status(status).json({ message });
});

// Start the API even if MongoDB is not ready, so the problem is easier to see.
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () =>
  console.log(`Server is ready on port ${port}`),
);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log(`MongoDB connected to ${mongoose.connection.name}`))
  .catch((error) =>
    console.log(
      "MongoDB is not connected. Start MongoDB and check MONGO_URL:",
      error.message,
    ),
  );
