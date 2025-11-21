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
const videoRouter = require("./routes/videoCreator");
const session = require("express-session");
const cors = require("cors");
const contestRouter = require("./routes/contest");
const challengeRouter = require("./routes/challenge");
const aiInterviewRouter = require("./routes/aiInterview");
const initSocket = require("./config/socket");
const { Server } = require("socket.io");
const http = require("http");
const resumeRouter = require("./routes/resumeRoutes");
const aiVideoRouter = require("./routes/videoInterviewRouter");
const socialRouter = require("./routes/social");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend URL
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
initSocket(io);

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://codearena.digital",
      "https://www.codearena.digital",
      "https://codearena1-r7ab8a9ah-vipuls-projects-75a276d5.vercel.app", // add this
      "https://codearena1-ezm7gs1p9-vipuls-projects-75a276d5.vercel.app", // and this (latest)
      "http://localhost:5173",
    ],
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
      sameSite: "none", // needed for cross-site requestsr
      httpOnly: true,
    },
  })
);

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);
app.use("/contest", contestRouter);
app.use("/challenge", challengeRouter);
app.use("/ai-interview", aiInterviewRouter);
app.use("/api/video-interview", aiVideoRouter);
app.use("/resume", resumeRouter);
app.use("/social", socialRouter);

app.get("/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});

const initialseDB = async () => {
  try {
    await Promise.all([connectDB(), redisClient.connect()]);
    console.log("connected to DB and REDIS");
    server.listen(process.env.PORT, () => {
      console.log(
        "✅ Server + Socket.IO listening on port " + process.env.PORT
      );
    });
  } catch (error) {
    console.log("error occured while connect to DB and REDIS");
    console.log(error);
  }
};

initialseDB();
