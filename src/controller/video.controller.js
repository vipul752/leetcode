const cloudinary = require("cloudinary").v2;
const Problem = require("../model/problem");
const SolutionVideo = require("../model/solutionVideo");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateUploadSignature = async (req, res) => {
  try {
    const { id: problemId } = req.params;
    const userId = req.result._id;

    console.log("Upload request for problemId:", problemId);

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `leetcode-solution/${problemId}/${userId}_${timestamp}`;

    const uploadParams = { timestamp, public_id: publicId };

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });
  } catch (error) {
    console.error("Error generating upload signature:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const saveVideoMetaData = async (req, res) => {
  try {
    const { problemId, cloudinaryPublicId, secureUrl, duration } = req.body;
    const userId = req.result._id;

    const existingVideo = await SolutionVideo.findOne({
      cloudinaryPublicId,
      userId,
      problemId,
    });
    if (existingVideo) {
      return res.status(400).json({ error: "Video metadata already exists" });
    }

    // const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
    //   resource_type: "video",
    //   transformation: [
    //     { width: 400, height: 225, crop: "fill" },
    //     { quality: "auto" },
    //     { start_offset: "auto" },
    //   ],
    //   format: "jpg",
    // });

    const thumbnailUrl = cloudinary.image(cloudinaryPublicId, {
      resource_type: "video",
    });
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration,
      thumbnailUrl,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        secureUrl: videoSolution.secureUrl,
        createdAt: videoSolution.createdAt,
        updatedAt: videoSolution.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving video metadata:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.body;

    const video = await SolutionVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
      resource_type: "video",
      invalidate: true,
    });

    await SolutionVideo.findByIdAndDelete(videoId);
    console.log("Delete request for video:", req.params.videoId);

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  generateUploadSignature,
  saveVideoMetaData,
  deleteVideo,
};
