const jwt = require("jsonwebtoken");
const Activity = require("../models/Activity");
const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const registerOwner = async (req, res) => {
  try {
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0) {
      return res.status(409).json({
        message: "Owner account already exists. Please log in."
      });
    }

    const user = await User.create({
      name: req.body.name || process.env.OWNER_NAME || "Shop Owner",
      email: req.body.email || process.env.OWNER_EMAIL,
      password: req.body.password || process.env.OWNER_PASSWORD
    });

    await Activity.create({
      type: "auth",
      message: `Owner account created for ${user.email}`,
      entityType: "User",
      entityId: user._id
    });

    return res.status(201).json({
      user,
      token: signToken(user._id)
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await Activity.create({
      type: "auth",
      message: `${user.name} signed in`,
      entityType: "User",
      entityId: user._id
    });

    user.password = undefined;

    return res.json({
      user,
      token: signToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  registerOwner,
  login,
  getMe
};

