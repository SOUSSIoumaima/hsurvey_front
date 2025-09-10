import axios from "axios";
import { getApiBaseUrl } from "./apiService";

async function createOptionApiClient() {
  const baseURL = await getApiBaseUrl();
  const client = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });

  // Intercepteur pour ajouter token CSRF sur méthodes modifiant les données
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
    console.error("[optionService] error", error.response?.status, error.response?.data);
    throw error;
  }
}

export const optionService = {
  getAllOptions: async () => {
    const client = await createOptionApiClient();
    return handleRequest(client.get("/options"));
  },

  getOptionById: async (optionId) => {
    const client = await createOptionApiClient();
    return handleRequest(client.get(`/options/${optionId}`));
  },

  getOptionsByQuestionId: async (questionId) => {
    const client = await createOptionApiClient();
    return handleRequest(client.get(`/options/byQuestion/${questionId}`));
  },

  createOption: async (optionData) => {
    const client = await createOptionApiClient();
    return handleRequest(client.post("/options", optionData));
  },

  updateOption: async (optionId, optionData) => {
    const client = await createOptionApiClient();
    return handleRequest(client.put(`/options/${optionId}`, optionData));
  },

  deleteOption: async (optionId) => {
    const client = await createOptionApiClient();
    return handleRequest(client.delete(`/options/${optionId}`));
  },

  lockOption: async (optionId) => {
    const client = await createOptionApiClient();
    return handleRequest(client.patch(`/options/${optionId}/lock`));
  },

  unlockOption: async (optionId) => {
    const client = await createOptionApiClient();
    return handleRequest(client.patch(`/options/${optionId}/unlock`));
  },
};
