const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const logger = require("./lib/logger");
const { initializeFirebase, isConnected } = require("./lib/firebase");
const { handleError } = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());
try {
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CORS_ORIGIN || "https://your-domain.com"
          : "http://localhost:5173",
      credentials: true,
    })
  );
} catch (error) {
  logger.error("CORS configuration error", error.message);
  process.exit(1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/prescriptions", require("./routes/prescriptions"));
app.use("/api/medicines", require("./routes/medicines"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: isConnected() ? "Connected" : "Disconnected",
    platform: "Google Cloud Platform",
    service: "Firebase/Firestore"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", err && err.message ? err.message : err);
  res.status(err.status || 500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err && err.message
          ? err.message
          : err
        : undefined,
  });
});

app.use(handleError);

const PORT = process.env.PORT || 3333;

let server;

async function start() {
  try {
    // Initialize Firebase
    await initializeFirebase();
    logger.info("✅ Firebase/Firestore connected");

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV}`);
      logger.info(`☁️ Platform: Google Cloud Platform`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down");
  if (server) server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  if (server) server.close(() => process.exit(0));
});
