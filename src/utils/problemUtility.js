const axios = require("axios");

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const getLanguageId = (lang) => {
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
    python: 71,
  };
  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": "6ea65d2e08msh61e6135df82a37ap12b33ajsn2cedea2a3cf6",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "6ea65d2e08msh61e6135df82a37ap12b33ajsn2cedea2a3cf6",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };
  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while (true) {
    const result = await fetchData();
    const isResultObtained = result.submissions.every((r) => r.status_id > 2);
    if (isResultObtained) return result.submissions;

    await waiting(1000);
  }
};

module.exports = { getLanguageId, submitBatch, submitToken };
