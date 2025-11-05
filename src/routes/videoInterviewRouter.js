const express = require("express");
const axios = require("axios");
require("dotenv").config();

const videoRouter = express.Router();

videoRouter.post("/create-room", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        properties: {
          exp: Math.round(Date.now() / 1000) + 15 * 60, 
          enable_chat: true,
          enable_knocking: false,
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const roomUrl = response.data.url;
    res.json({ roomUrl });
  } catch (error) {
    console.error(
      "Error creating Daily room:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to create video room" });
  }
});

module.exports = videoRouter;
