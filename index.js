const express = require("express");
const app = express();

// Middleware to parse JSON bodies and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3500;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Query:", JSON.stringify(req.query, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// Basic health check endpoint
app.get("/", (req, res) => {
  console.log("[Health Check] Endpoint accessed");
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Callback endpoint to handle Cognifit responses
app.post("/callback", (req, res) => {
  console.log("[Callback POST] Received request");
  try {
    const {
      status,
      tasks,
      tasksDone,
      trainings,
      trainingsDone,
      assessments,
      assessmentsDone,
      user_token,
    } = req.body;

    console.log("[Callback POST] Processed data:", {
      status,
      taskCount: tasks?.length,
      tasksDoneCount: tasksDone?.length,
      trainingCount: trainings?.length,
      trainingsDoneCount: trainingsDone?.length,
      assessmentCount: assessments?.length,
      assessmentsDoneCount: assessmentsDone?.length,
      hasUserToken: !!user_token,
    });

    // Handle different status cases
    switch (status) {
      case "completed":
        console.log("[Callback POST] Completed status received");
        return res.status(200).json({
          success: true,
          message: "Tasks completed successfully",
        });

      case "aborted":
        console.log("[Callback POST] Aborted status received");
        return res.status(200).json({
          success: true,
          message: "Session aborted",
        });

      case "loginError":
        console.log("[Callback POST] Login error status received");
        return res.status(401).json({
          success: false,
          message: "Login error occurred",
        });

      default:
        console.log("[Callback POST] Unknown status received:", status);
        return res.status(400).json({
          success: false,
          message: "Unknown status received",
          status,
        });
    }
  } catch (error) {
    console.error("[Callback POST] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Handle GET requests for the callback URL
app.get("/callback", (req, res) => {
  console.log("[Callback GET] Received request");
  try {
    const queryParams = req.query;
    console.log("[Callback GET] Query parameters:", queryParams);

    const {
      status,
      tasks,
      tasksDone,
      trainings,
      trainingsDone,
      assessments,
      assessmentsDone,
      user_token,
    } = queryParams;

    // Log the processed data
    console.log("[Callback GET] Processed data:", {
      status,
      hasUserToken: !!user_token,
    });

    switch (status) {
      case "completed":
      case "aborted":
      case "loginError":
        return res.status(200).json({
          success: true,
          message: `Received ${status} status`,
          data: queryParams,
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Unknown status received",
          status,
        });
    }
  } catch (error) {
    console.error("[Callback GET] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Error Middleware]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// For Render deployment
if (process.env.NODE_ENV === "production") {
  console.log("[Startup] Starting server in production mode");
} else {
  console.log("[Startup] Starting server in development mode");
}

// Server startup
const server = app.listen(PORT, () => {
  console.log(`[Startup] Server is running on port ${PORT}`);
  console.log(`[Startup] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Startup] Time: ${new Date().toISOString()}`);
});

// Handle server shutdown
process.on("SIGTERM", () => {
  console.log("[Shutdown] SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("[Shutdown] Server closed");
  });
});

module.exports = app;
