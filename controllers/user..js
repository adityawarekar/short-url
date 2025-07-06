const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  try {
    await User.create({
      name,
      email,
      password, // ❗ in real apps, hash this
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).send("Error signing up user");
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password }); // ❗ compare using bcrypt in real apps

    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const sessionId = uuidv4();
    setUser(sessionId, user); // ✅ pass the actual user, not the model

    res.cookie("uid", sessionId); // ✅ set cookie

    return res.redirect("/");
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).send("Error logging in user");
  }
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};
