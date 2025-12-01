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

    const { code, language } = req.body;

    let processedLanguage = language;
    if (processedLanguage === "cpp") processedLanguage = "c++";

    if (!code || !processedLanguage) {
      return res
        .status(400)
        .json({ message: "Code and language are required" });
    }

    const problem = await Problem.findById(problem_id);

    const submittedResult = await Submission.create({
      user_id,
      problem_id,
      code,
      language: processedLanguage,
      status: "Pending",
      testCasesTotal:
        (problem.hiddenTestcase && problem.hiddenTestcase.length) || 0,
    });

    const languageId = getLanguageId(processedLanguage);

    const submissions = (problem.hiddenTestcase || []).map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runTime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = "";

    for (const test of testResult) {
      if (test.status && test.status.id === 3) {
        testCasesPassed++;
        runTime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = test.status && test.status.id === 4 ? "Wrong Answer" : "Error";
        errorMessage = test.stderr || test.compile_output || "Unknown error";
        break;
      }
    }

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runTime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;

    await submittedResult.save();

    if (!req.result.problemSolved.includes(problem_id)) {
      const user = req.result;
      user.problemSolved.push(problem_id);
      await user.save();
    }

    const accepted = status === "Accepted";
    res.status(200).json({
      accepted,
      totalTestCases: problem.hiddenTestcase.length,
      passedTestCases: testCasesPassed,
      runTime,
      memory,
      
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

    const { code, language } = req.body;

    if (!code || !language) {
      return res
        .status(400)
        .json({ message: "Code and language are required" });
    }

    const problem = await Problem.findById(problem_id);
    let processedLanguage = language;
    if (processedLanguage === "cpp") processedLanguage = "c++";

    const languageId = getLanguageId(processedLanguage);

    const submissions = problem.visibleTestcase.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runTime = 0;
    let memory = 0;
    let status = true;
    let testResults = [];

    for (const test of testResult) {
      const passed = test.status && test.status.id === 3;
      if (passed) {
        testCasesPassed++;
        runTime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = false;
      }
      testResults.push({
        passed,
        input: test.stdin || "",
        expectedOutput: test.expected_output || "",
        output: test.stdout || "",
        error: test.stderr || test.compile_output || "",
        time: test.time || 0,
        memory: test.memory || 0,
      });
    }
    res.status(200).json({
      success: status,
      testCases: testResults,
      runTime,
      memory,
      totalTestCases: problem.visibleTestcase.length,
      passedTestCases: testCasesPassed,
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ message: "Internal server error" } + error);
  }
};

module.exports = {
  submitCode,
  runCode,
};
