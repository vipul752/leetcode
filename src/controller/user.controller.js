const User = require("../model/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const Submission = require("../model/submission");
const sendEmail = require("../utils/sendEmail");
const Problem = require("../model/problem");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
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
        expiresIn: "24h",
      }
    );

    const reply = {
      firstName: user.firstName,
      email: user.email,
      _id: user._id,
    };
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 86400000,
    });

    res.status(201).json({
      user: reply,
    });
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
      sameSite: "none",
      secure: true,
      maxAge: 86400000,
    });

    const reply = {
      firstName: user.firstName,
      email: user.email,
      _id: user._id,
    };

    res.status(200).json({
      user: reply,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log in user" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.send("Logged out successfully");
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

    const user = await User.create({ ...req.body, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const user = req.result._id;

    await User.findByIdAndDelete(user);

    await Submission.deleteMany({ userId: user });

    res.status(200).json({ message: "Profile Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete profile" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("problemSolved.problem");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const { firstName, lastName, bio, avatar, location, age } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, bio, avatar, location, age },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", profile: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const getNoOfUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ userCount: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch users count" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link is valid for 1 hour.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: message,
      });
      console.log("✅ Email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Continue anyway, user can still use the token
    }

    res.status(200).json({
      message: "Password reset link sent to email",
      resetToken: resetToken, // For testing - remove in production
    });
  } catch (error) {
    console.error("❌ Forget password error:", error);
    res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(newPassword, salt);

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

const dashBoard = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId)
      .select(
        "firstName lastName totalSolved problemSolved followers avatar posts submissions"
      )
      .populate("problemSolved")
      .populate("posts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalProblemsSolved =
      user.totalSolved || user.problemSolved?.length || 0;
    const recentProblems = (user.problemSolved || [])
      .slice(0, 10)
      .map((problemId) => ({
        problemId,
      }));

    const submissions = await Submission.find({ user_id: userId });

    const solvedSet = new Set();
    let totalSubmissions = submissions.length;
    let accepted = 0;

    submissions.forEach((s) => {
      if (s.status === "Accepted") {
        solvedSet.add(s.problem_id.toString());
        accepted++;
      }
    });

    const problems = await Problem.find({ _id: { $in: [...solvedSet] } });
    const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => byDifficulty[p.difficulty]++);

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      totalProblemsSolved,
      recentProblems,
      followersCount: user.followers?.length || 0,
      oneVsOneStats: user.oneVsOneStats,
      posts: user.posts,
      totalSubmissions,
      acceptanceRate: totalSubmissions
        ? (accepted / totalSubmissions) * 100
        : 0,
      byDifficulty,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  getProfile,
  updateProfile,
  getNoOfUsers,
  forgetPassword,
  resetPassword,
  dashBoard,
};
