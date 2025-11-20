const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  getProfile,
  getNoOfUsers,
  updateProfile,
} = require("../controller/user.controller");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/admin/register", adminMiddleware, adminRegister);
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);
authRouter.get("/check", userMiddleware, (req, res) => {
  const reply = {
    firstName: req.result.firstName,
    email: req.result.email,
    _id: req.result._id,
    role: req.result.role,
  };

  res.status(200).json({ user: reply });
});
authRouter.get("/getProfile", userMiddleware, getProfile);
authRouter.put("/updateProfile", userMiddleware, updateProfile);
authRouter.get("/getNoOfUsers", getNoOfUsers);

module.exports = authRouter;
