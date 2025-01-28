const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse URL-encoded bodies (important for form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3500;

app.post("/callback", (req, res) => {
  console.log("Received callback data:", req.body);

  const { status, message, user_token } = req.body;

  // Log the cleaned token for debugging
  console.log("Received token:", user_token?.replace(/\s+/g, ""));

  // Respond with appropriate status
  res.json({
    success: status !== "loginError",
    message: message || "Callback processed",
    receivedStatus: status,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
