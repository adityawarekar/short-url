const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly } = require('./middlewares/auth');

const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express(); // ✅ define here before app.use

const PORT = 8001;

// DB connection
connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Middlewares
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
  },
}));
app.use(cookieParser()); // ✅ now valid
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// View engine
app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));

// Routes
app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);

// Redirect short URL
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("Error in redirecting:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
