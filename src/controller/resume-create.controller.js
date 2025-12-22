const ResumeCreate = require("../model/resume-create");

const createResume = async (req, res) => {
  try {
    const resumeData = req.body;
    const userId = req.result._id;

    const newResume = new ResumeCreate({
      ...resumeData,
      userId,
    });

    if (!newResume) {
      return res.status(400).json({ message: "Invalid resume data" });
    }

    const savedResume = await newResume.save();
    res.status(201).json({
      message: "Resume created successfully",
      resume: savedResume,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

const updateResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const updatedData = req.body;

    const updatedResume = await ResumeCreate.findByIdAndUpdate(
      resumeId,
      updatedData,
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({
      message: "Resume updated successfully",
      resume: updatedResume,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to update resume", error: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const deletedResume = await ResumeCreate.findByIdAndDelete(resumeId);

    if (!deletedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to delete resume", error: error.message });
  }
};

const userResume = async (req, res) => {
  try {
    const userId = req.result._id;

    const resumes = await ResumeCreate.find({ userId });
    if (!resumes) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user" });
    }
    res.status(200).json({ resumes });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch resumes", error: error.message });
  }
};

const getSingleResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await ResumeCreate.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ resume });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch resume", error: error.message });
  }
};

module.exports = {
  createResume,
  updateResume,
  deleteResume,
  userResume,
  getSingleResume,
};
