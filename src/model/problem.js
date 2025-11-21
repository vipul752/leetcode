const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  tags: {
    type: String,
    enum: [
      "Array",
      "LinkedList",
      "DP",
      "Graph",
      "String",
      "Stack",
      "Queue",
      "Heap",
      "Tree",
      "Math",
      "Greedy",
      "Backtracking",
      "Sorting",
      "Searching",
      "Bit Manipulation",
      "Recursion",
      "Hashing",
      "Sliding Window",
      "Two Pointers",
      "Divide and Conquer",
      "Dynamic Programming",
      "Trie",
      "Segment Tree",
      "Binary Indexed Tree",
      "Graph Algorithms",
      "Geometry",
      "Game Theory",
      "Combinatorics",
      "Number Theory",
      "Probability",
      "Others",
    ],
    default: [],
    required: true,
  },
  visibleTestcase: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explaination: {
        type: String,
      },
    },
  ],

  hiddenTestcase: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],

  startCode: [
    {
      language: {
        type: String,
      },
      initialCode: {
        type: String,
      },
    },
  ],
  referenceSolution: [
    {
      language: {
        type: String,
      },
      completeCode: {
        type: String,
      },
    },
  ],

  contests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contest",
    },
  ],

  problemCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const Problem = mongoose.model("problem", problemSchema);

module.exports = Problem;
