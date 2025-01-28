const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
const PORT = 3500;
// Callback endpoint for authentication and authorization
app.get('/', (req, res) => { 
    res.json("hello world!");
}
    
)
app.get("/callback", (req, res) => {
  // Here you would typically handle the callback from your auth provider
  // For this example, we'll just send a simple response
  res.json({ message: "Authentication callback received", query: req.query });
});
console.log("happend");

// For Vercel, we need to export the Express app
module.exports = app;

// If running the server directly (not on Vercel)
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

