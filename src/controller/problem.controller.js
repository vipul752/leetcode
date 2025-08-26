const Problem = require("../model/problem");
const User = require("../model/user");
const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");

const createProblem = async (req, res) => {
  try {
    const { visibleTestcase, referenceSolution } = req.body;

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      const submissions = visibleTestcase.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        const { status, stdout, stderr, compile_output } = test;

        switch (status.id) {
          case 1:
          case 2:
            return res.status(202).json({
              success: false,
              message: "Testcase still running",
              status: status.description,
            });

          case 3:
            break;

          case 4:
            return res.status(400).json({
              success: false,
              message: "Wrong Answer",
              expected: test.expected_output?.trim(),
              got: stdout?.trim(),
            });

          case 5:
            return res.status(408).json({
              success: false,
              message: "Time Limit Exceeded",
            });

          case 6:
            return res.status(400).json({
              success: false,
              message: "Compilation Error",
              compilerOutput: compile_output,
            });

          case 7:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
            return res.status(400).json({
              success: false,
              message: `Runtime Error: ${status.description}`,
              stderr,
            });

          case 13:
            return res.status(500).json({
              success: false,
              message: "Internal Error on Judge",
            });

          case 14:
            return res.status(400).json({
              success: false,
              message: "Exec Format Error",
            });

          default:
            return res.status(400).json({
              success: false,
              message: `Unknown status: ${status.description}`,
            });
        }
      }
    }

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem saved successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to create problem" });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestcase,
      hiddenTestcase,
      startCode,
      referenceSolution,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required",
      });
    }

    const DSAProblem = await Problem.findById(id);
    if (!DSAProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      const submissions = visibleTestcase.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        const { status, stdout, stderr, compile_output } = test;

        switch (status.id) {
          case 1:
          case 2:
            return res.status(202).json({
              success: false,
              message: "Testcase still running",
              status: status.description,
            });

          case 3:
            break;

          case 4:
            return res.status(400).json({
              success: false,
              message: "Wrong Answer",
              expected: test.expected_output?.trim(),
              got: stdout?.trim(),
            });

          case 5:
            return res.status(408).json({
              success: false,
              message: "Time Limit Exceeded",
            });

          case 6:
            return res.status(400).json({
              success: false,
              message: "Compilation Error",
              compilerOutput: compile_output,
            });

          case 7:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
            return res.status(400).json({
              success: false,
              message: `Runtime Error: ${status.description}`,
              stderr,
            });

          case 13:
            return res.status(500).json({
              success: false,
              message: "Internal Error on Judge",
            });

          case 14:
            return res.status(400).json({
              success: false,
              message: "Exec Format Error",
            });

          default:
            return res.status(400).json({
              success: false,
              message: `Unknown status: ${status.description}`,
            });
        }
      }
    }

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );
    res.status(201).send("Problem update successfully", newProblem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to update problem" });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required",
      });
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }
    res.status(204).send("Problem Deleted Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to delete problem" });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required",
      });
    }

    const foundProblem = await Problem.findById(id).select(
      "_id title description difficulty visibleTestcase startCode "
    );
    if (!foundProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }
    res.status(200).send(foundProblem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get problem" });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const allProblem = await Problem.find({}).select(
      "_id title difficulty tags"
    );
    if (allProblem.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No Problem found",
      });
    }
    res.status(200).send(allProblem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get all problem" });
  }
};

const solvedProblemByUser = async (req, res) => {
  try {
    const user = req.result;
    await user.populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });

    res.status(200).json(user.problemSolved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get solved problem count" });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const user_id = req.result._id;
    const problem_id = req.params.pid;

    const submissionCount = await Submission.find({ user_id, problem_id });
    if (submissionCount.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this problem by the user",
      });
    }
    res.status(200).json({ submissionCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to get submissions count" });
  }
};



module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedProblemByUser,
  submittedProblem,
};
