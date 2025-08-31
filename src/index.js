const express = require("express");
const app = express();
require("dotenv").config;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submission");
const aiRouter = require("./routes/ai");
const session = require("express-session");
const cors = require("cors");

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://68b436872fd3df4fafd146d2--leetcode12.netlify.app",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // true because Render uses HTTPS
      sameSite: "none", // needed for cross-site requests
      httpOnly: true,
    },
  })
);

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);

app.get("/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});

const initialseDB = async () => {
  try {
    await Promise.all([connectDB(), redisClient.connect()]);
    console.log("connected to DB and REDIS");
    app.listen(process.env.PORT, () => {
      console.log("server listen on port" + process.env.PORT);
    });
  } catch (error) {
    console.log("error occured while connect to DB and REDIS");
    console.log(error);
  }
};

initialseDB();
