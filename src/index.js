const express = require("express");
const app = express();
require("dotenv").config;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);

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
