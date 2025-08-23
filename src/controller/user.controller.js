const User = require("../model/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const redisClient = require("../config/redis");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    req.body.role = "user";
    const user = await User.create({ ...req.body, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log in user" });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(400).json({ message: "No token provided" });

    const payload = jwt.decode(token);
    if (!payload) return res.status(400).json({ message: "Invalid token" });

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log out user" });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    req.body.role = "admin";
    const user = await User.create({ ...req.body, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

module.exports = { register, login, logout };
