import axios from "axios";
import { getApiBaseUrl } from "./apiService";

async function createQuestionApiClient() {
  const baseURL = await getApiBaseUrl();
  const client = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    if (["post", "put", "delete", "patch"].includes(config.method)) {
      const xsrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = xsrfToken;
      }
    }
    return config;
  });

  return client;
}

async function handleRequest(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    console.error("[questionService] error", error.response?.status, error.response?.data);
    throw error;
  }
}

export const questionService = {
  getAllQuestions: async () => {
    const client = await createQuestionApiClient();
    return handleRequest(client.get("/questions"));
  },

  createQuestion: async (questionData) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.post("/questions", questionData));
  },

  getQuestionById: async (questionId) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.get(`/questions/${questionId}`));
  },

  updateQuestion: async (questionId, questionData) => {
    const client = await createQuestionApiClient();
     console.log("Updating question ID:", questionId);
     console.log("Payload being sent:", questionData);
    return handleRequest(client.put(`/questions/${questionId}`, questionData));
  },

  deleteQuestion: async (questionId) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.delete(`/questions/${questionId}`));
  },

  lockQuestion: async (questionId) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.patch(`/questions/${questionId}/lock`));
  },

  unlockQuestion: async (questionId) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.patch(`/questions/${questionId}/unlock`));
  },

  getBySubject: async (subject) => {
    const client = await createQuestionApiClient();
    return handleRequest(client.get(`/questions/subject/${encodeURIComponent(subject)}`));
  },
};

