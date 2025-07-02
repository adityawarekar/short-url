const express = require("express");
const path = require("path");
const urlRoute = require("./routes/url");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");

const app = express();
const PORT = 8001;


connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));


app.use(express.json());

app.get("/test", async (req, res) => {
   const allUrls = await  URL.find({});
   return res.render("home", {
      urls: allUrls,
   });
});

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));
app.use("/url", urlRoute);


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


app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
