const express = require("express");
const app = express();

// Middleware to parse JSON bodies and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3500;

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json("hello world!");
});

// Callback endpoint to handle Cognifit responses
app.post("/callback", (req, res) => {
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

    // Log the received data
    console.log("Received callback data:", {
      status,
      tasks,
      tasksDone,
      trainings,
      trainingsDone,
      assessments,
      assessmentsDone,
      user_token,
    });

    // Handle different status cases
    switch (status) {
      case "completed":
        // Handle completed status
        return res.status(200).json({
          success: true,
          message: "Tasks completed successfully",
          data: { status, tasksDone, trainingsDone, assessmentsDone },
        });

      case "aborted":
        // Handle aborted status
        return res.status(200).json({
          success: true,
          message: "Session aborted",
          data: { status, tasksDone, trainingsDone, assessmentsDone },
        });

      case "loginError":
        // Handle login error
        return res.status(401).json({
          success: false,
          message: "Login error occurred",
          error: "Authentication failed",
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Unknown status received",
          status,
        });
    }
  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Also handle GET requests for the callback URL
app.get("/callback", (req, res) => {
  try {
    const queryParams = req.query;
    console.log("Received GET callback with params:", queryParams);

    // Handle the query parameters similarly to POST
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

    // Similar status handling as POST
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
    console.error("Error processing GET callback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
