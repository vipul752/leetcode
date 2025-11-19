const Contest = require("../model/contest");
const Problem = require("../model/problem");
const {
  submitBatch,
  submitToken,
  getLanguageId,
} = require("../utils/problemUtility");
const ContestSubmission = require("../model/contestSubmission");

const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body;

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one problem must be included" });
    }

    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    for (const problemId of problems) {
      const problem = await Problem.findById(problemId);

      if (!problem) {
        return res
          .status(404)
          .json({ message: `Problem with ID ${problemId} not found` });
      }

      const { visibleTestcase, referenceSolution } = problem;

      // Skip empty or invalid reference solutions
      if (!referenceSolution || referenceSolution.length === 0) {
        return res.status(400).json({
          message: `Problem ${problem.title} missing referenceSolution`,
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
        const resultTokens = submitResult.map((res) => res.token);
        const testResults = await submitToken(resultTokens);

        for (const test of testResults) {
          const { status, stdout } = test;

          switch (status.id) {
            case 3:
              // Accepted ✅
              break;
            case 4:
              return res.status(400).json({
                message: `Problem "${problem.title}" failed verification: Wrong Answer`,
                expected: test.expected_output?.trim(),
                got: stdout?.trim(),
              });
            case 5:
              return res.status(400).json({
                message: `Problem "${problem.title}" failed verification: Time Limit Exceeded`,
              });
            case 6:
              return res.status(400).json({
                message: `Problem "${problem.title}" failed verification: Compilation Error`,
              });
            default:
              return res.status(400).json({
                message: `Problem "${problem.title}" failed verification: ${status.description}`,
              });
          }
        }
      }
    }

    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      problems,
    });

    for (const problemId of problems) {
      await Problem.findByIdAndUpdate(problemId, {
        $addToSet: { contests: contest._id },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Contest created successfully with verified problems!",
      contest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create contest" });
  }
};

const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate({
        path: "problems",
        select: "id title",
      })
      .sort({ startTime: 1 });

    const currentTime = new Date();

    for (const contest of contests) {
      let newStatus = contest.status;

      if (currentTime < contest.startTime) newStatus = "upcoming";
      else if (
        currentTime >= contest.startTime &&
        currentTime <= contest.endTime
      )
        newStatus = "live";
      else newStatus = "ended";

      if (contest.status !== newStatus) {
        contest.status = newStatus;
        await contest.save();
      }
    }

    // Send updated contests
    res.status(200).json({ contests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch contests" });
  }
};

const getSingleContests = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId).populate({
      path: "problems",
      select: "id title",
    });

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }
    const isRegistered = contest.participants.includes(req.result._id);

    res.status(200).json({ contest, isRegistered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch contest" });
  }
};

const registerUserToContest = async (req, res) => {
  try {
    const contestId = req.params.contestId;
    const userId = req.result._id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User already registered for this contest" });
    }
    contest.participants.push(userId);
    await contest.save();

    res
      .status(200)
      .json({ message: "User registered to contest successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user to contest" });
  }
};

const unregisterUserFromContest = async (req, res) => {
  try {
    const contestId = req.params.contestId;
    const userId = req.result._id;

    if (!contestId || !userId) {
      res.status(400).json({ message: "contestId and userId are required" });
    }

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    contest.participants = contest.participants.filter(
      (participantId) => participantId.toString() !== userId.toString()
    );

    await contest.save();

    res
      .status(200)
      .json({ message: "User unregistered from contest successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to unregister user from contest" });
  }
};

const submitContestCode = async (req, res) => {
  try {
    const user_id = req.result._id;
    const { contestId, problemId } = req.params;
    const { code, language } = req.body;

    if (!code || !language)
      return res
        .status(400)
        .json({ message: "Code and language are required" });

    let processedLanguage = language;
    if (processedLanguage === "cpp") processedLanguage = "c++";

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const now = new Date();
    if (now < contest.startTime)
      return res.status(400).json({ message: "Contest has not started yet" });
    if (now > contest.endTime)
      return res.status(400).json({ message: "Contest has ended" });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const languageId = getLanguageId(processedLanguage);
    const submissions = (problem.hiddenTestcase || []).map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map((v) => v.token);
    const testResult = await submitToken(tokens);

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

    // Create contest submission entry
    await ContestSubmission.create({
      userId: user_id,
      contestId,
      problemId,
      code,
      language: processedLanguage,
      status,
      testCasesPassed,
      testCasesTotal:
        (problem.hiddenTestcase && problem.hiddenTestcase.length) || 0,
      runtime: runTime,
      memory,
      errorMessage,
    });

    res.status(200).json({
      accepted: status === "Accepted",
      totalTestCases:
        (problem.hiddenTestcase && problem.hiddenTestcase.length) || 0,
      passedTestCases: testCasesPassed,
      runTime,
      memory,
    });
  } catch (err) {
    console.error("Error in contest submission:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userContestSubmissions = async (req, res) => {
  try {
    const { contestId, userId } = req.params;

    const submissions = await ContestSubmission.find({ contestId, userId })
      .populate({
        path: "problemId",
        select: "id title",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching contest submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllContestsParticipants = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const participantCount = contest.participants.length;

    res.status(200).json({ participantCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNumberOfProblemInEachContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const problemCount = contest.problems.length;

    res.status(200).json({ problemCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getContestProblems = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId).populate({
      path: "problems",
      select: "id title",
    });

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json({
      success: true,
      contestName: contest.name,
      problems: contest.problems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch contest problems" });
  }
};

const userContest = async (req, res) => {
  try {
    const userId = req.result._id;
    const contests = await Contest.find({ participants: userId })
      .populate({
        path: "problems",
        select: "id title",
      })
      .sort({ startTime: 1 });

    res.status(200).json({ contests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.result._id;
    const submissions = await ContestSubmission.find({ userId })
      .populate({
        path: "contestId",
        select: "id title",
      })
      .populate({
        path: "problemId",
        select: "id title",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ submissions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createContest,
  getAllContests,
  registerUserToContest,
  unregisterUserFromContest,
  submitContestCode,
  userContestSubmissions,
  getAllContestsParticipants,
  getNumberOfProblemInEachContest,
  getSingleContests,
  getContestProblems,
  userContest,
  getUserSubmissions,
};
