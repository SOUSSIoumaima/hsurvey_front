import axios from "axios";
import { getApiBaseUrl } from "./apiService";

async function createSurveyApiClient() {
  const baseURL = await getApiBaseUrl();
  const client = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });

  // Ajout interception CSRF token (optionnel, selon si ton backend le demande)
  client.interceptors.request.use((config) => {
    if (["post", "put", "delete", "patch"].includes(config.method)) {
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = xsrfToken;
      }
    }
    return config;
  });

  return client;
}

// Gestion d'erreur centralisée
async function handleRequest(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    console.error(
      "[surveyService] error",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
}

export const surveyService = {
  getAllSurveys: async () => {
    const client = await createSurveyApiClient();
    return handleRequest(client.get("/surveys"));
  },

  createSurvey: async (surveyData) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.post("/surveys", surveyData));
  },

  getSurveyById: async (surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.get(`/surveys/${surveyId}`));
  },

  updateSurvey: async (surveyId, surveyData) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.put(`/surveys/${surveyId}`, surveyData));
  },

  deleteSurvey: async (surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.delete(`/surveys/${surveyId}`));
  },

  assignQuestionToSurvey: async (surveyId, questionId) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.post(`/surveys/${surveyId}/question/${questionId}`)
    );
  },

  unassignQuestionFromSurvey: async (surveyId, questionId) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.delete(`/surveys/${surveyId}/question/${questionId}`)
    );
  },

  lockSurvey: async (surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.patch(`/surveys/${surveyId}/lock`, {}));
  },

  unlockSurvey: async (surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.patch(`/surveys/${surveyId}/unlock`, {}));
  },

  surveyExists: async (surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(client.get(`/surveys/${surveyId}/exists`));
  },
   publishSurvey: async (surveyId) => {
    const client = await createSurveyApiClient();
    try {
      const response = await client.put(`/surveys/${surveyId}/publish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveAndClosedSurveys: async () => {
    const client = await createSurveyApiClient();
    return handleRequest(client.get("/surveys/active-closed"));
  },

  // Survey Assignment to Departments and Teams
  assignSurveyToDepartment: async (organizationId, departmentId, surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.post(
        `/organizations/${organizationId}/departments/${departmentId}/assign-survey/${surveyId}`
      )
    );
  },

  assignSurveyToTeam: async (organizationId, teamId, surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.post(
        `/organizations/${organizationId}/teams/${teamId}/assign-survey/${surveyId}`
      )
    );
  },

  removeSurveyFromDepartment: async (
    organizationId,
    departmentId,
    surveyId
  ) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.delete(
        `/organizations/${organizationId}/departments/${departmentId}/remove-survey/${surveyId}`
      )
    );
  },

  removeSurveyFromTeam: async (organizationId, teamId, surveyId) => {
    const client = await createSurveyApiClient();
    return handleRequest(
      client.delete(
        `/organizations/${organizationId}/teams/${teamId}/remove-survey/${surveyId}`
      )
    );
  },
};
