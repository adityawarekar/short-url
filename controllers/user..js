const User = require("../models/user");

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;
    
    try {
        await User.create({
            name,
            email,
            password,
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
       await User.findOne({ email, password });

        return res.redirect("/");
    } catch (error) {
        console.error("Invalid Username or password", error);
        return res.status(500).send("Error login user");
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
}
