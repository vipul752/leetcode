const Problem = require("../model/problem");
const Submission = require("../model/submission");
const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const submitRateLimiter = require("../middleware/redisRateLimiter");

const submitCode = async (req, res) => {
  try {
    const user_id = req.result._id;

    const problem_id = req.params.id;

    console.log(user_id, problem_id);
    const { code, language } = req.body;

    if (!code || !language) {
      return res
        .status(400)
        .json({ message: "Code and language are required" });
    }

    const problem = await Problem.findById(problem_id);

    //store submission in databse to avoid the loss data
    const submittedResult = await Submission.create({
      user_id,
      problem_id,
      code,
      language,
      status: "Pending",
      testCasesPassed: problem.hiddenTestcase.length,
    });

    //submit to judge0 api
    const languageId = getLanguageId(language);

    const submissions = (problem.hiddenTestcase || []).map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
    console.log(submissions);

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runTime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = "";

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runTime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "Wrong";
          errorMessage = test.stderr;
        } else {
          status = "Error";
          errorMessage = test.stderr;
        }
      }
    }

    //save submission result in DB
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runTime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;

    await submittedResult.save();

    //check problemSolved in userSchema it is present or not
    if (!req.result.problemSolved.includes(problem_id)) {
      const user = req.result;
      user.problemSolved.push(problem_id);
      await user.save();
    }

    res.status(200).json({
      message: "Code submitted successfully",
      result: submittedResult,
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ message: "Internal server error" } + error);
  }
};

const runCode = async (req, res) => {
  try {
    const user_id = req.result._id;
    const problem_id = req.params.id;

    console.log(user_id, problem_id);
    const { code, language } = req.body;

    if (!code || !language) {
      return res
        .status(400)
        .json({ message: "Code and language are required" });
    }

    const problem = await Problem.findById(problem_id);

    //submit to judge0 api
    const languageId = getLanguageId(language);

    const submissions = problem.visibleTestcase.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
    console.log(submissions);

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    const statuses = testResult.map((t) => t.status.description);

    res.status(200).json({ statuses });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ message: "Internal server error" } + error);
  }
};

module.exports = {
  submitCode,
  runCode,
};
