const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL);
}

module.exports = connectDB;
