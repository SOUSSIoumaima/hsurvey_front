import axios from "axios";

let configPromise = null;

async function getConfig() {
  if (!configPromise) {
    configPromise = fetch("/config.json").then((res) => {
      if (!res.ok) throw new Error("Failed to load config.json");
      return res.json();
    });
  }
  return configPromise;
}

export async function getApiBaseUrl() {
  try {
    const config = await getConfig();
    return config.API_URL;
  } catch (error) {
    console.warn("Failed to load config.json, using fallback URL for local development");
    return "http://localhost:8080/api";
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}






async function createApiClient() {
  const baseURL = await getApiBaseUrl();
  const client = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });
  client.interceptors.request.use((config) => {
    if (["post", "put", "delete", "patch"].includes(config.method)) {
      const xsrfToken = getCookie("XSRF-TOKEN");
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
    console.error("[apiService] error", error.response?.status, error.response?.data);

    if (error.response && error.response.data) {
      const err = new Error("Backend Error");
      err.data = error.response.data; 
      throw err;
    }

    throw new Error(error.message || "Network Error");
  }
}


export const apiService = {
  
  // ----- User endpoints -----
  getUsers: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/users"));
  },

  addUser: async (userData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/users", userData));
  },

  updateUser: async (id, userData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/users/${id}`, userData));
  },

  deleteUser: async (id) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/users/${id}`));
  },

  getRoles: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/roles"));
  },

  createRole: async (roleData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/roles", roleData));
  },

  updateRole: async (roleId, data) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/roles/${roleId}`, data));
  },

  deleteRole: async (roleId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/roles/${roleId}`));
  },

  addPermissionToRole: async (roleId, permissionId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/roles/${roleId}/permissions/${permissionId}`));
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/roles/${roleId}/permissions/${permissionId}`));
  },

  assignRoleToUser: async (userId, roleId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/users/${userId}/roles/${roleId}`));
  },

  removeRoleFromUser: async (userId, roleId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/users/${userId}/roles/${roleId}`));
  },

  getPermissions: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/permissions"));
  },

  // ----- Organization endpoints -----
  getCurrentOrganization: async (organizationId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/organizations/${organizationId}`));
  },
  updateOrganization: async (id, organizationData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/organizations/${id}`, organizationData));
  },
// ----- department endpoints -----
  getDepartments: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/departments"));
  },

  createDepartment: async (departmentData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/departments", departmentData));
  },

  updateDepartment: async (id, departmentData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/departments/${id}`, departmentData));
  },

  deleteDepartment: async (id) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/departments/${id}`));
  },

  assignUserToDepartment: async (departmentId, userId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/departments/${departmentId}/assign-user/${userId}`));
  },

  removeUserFromDepartment: async (departmentId, userId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/departments/${departmentId}/remove-user/${userId}`));
  },

  getDepartmentUsers: async (departmentId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/departments/${departmentId}/users`));
  },

// ----- Team endpoints -----
  getTeams: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/teams"));
  },
  
  getTeamsByDepartment: async (departmentId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/teams/department/${departmentId}`));
  },

  getTeamUsers: async (teamId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/teams/${teamId}/users`));
  },

  assignUserToTeam: async (teamId, userId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/teams/${teamId}/assign-user/${userId}`));
  },

  removeUserFromTeam: async (teamId, userId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/teams/${teamId}/remove-user/${userId}`));
  },

  createTeam: async (teamData) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/teams`, teamData));
  },

  updateTeam: async (teamId, teamData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/teams/${teamId}`, teamData));
  },

  deleteTeam: async (teamId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/teams/${teamId}`));
  },

 

  // ----- Survey endpoints -----
  getAllSurveys: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/surveys"));
  },

  createSurvey: async (surveyData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/surveys", surveyData));
  },

  getSurveyById: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/surveys/${surveyId}`));
  },

  updateSurvey: async (surveyId, surveyData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/surveys/${surveyId}`, surveyData));
  },

  deleteSurvey: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/surveys/${surveyId}`));
  },

  assignQuestionToSurvey: async (surveyId, questionId) => {
    const client = await createApiClient();
    return handleRequest(client.post(`/surveys/${surveyId}/question/${questionId}`));
  },

  unassignQuestionFromSurvey: async (surveyId, questionId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/surveys/${surveyId}/question/${questionId}`));
  },

  lockSurvey: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.patch(`/surveys/${surveyId}/lock`));
  },

  unlockSurvey: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.patch(`/surveys/${surveyId}/unlock`));
  },

  surveyExists: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/surveys/${surveyId}/exists`));
  },

  publishSurvey: async (surveyId) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/surveys/${surveyId}/publish`));
  },

  getActiveAndClosedSurveys: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/surveys/active-closed"));
  },


  // ----- Question endpoints -----
  getAllQuestions: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/questions"));
  },

  getQuestionById: async (questionId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/questions/${questionId}`));
  },

  createQuestion: async (questionData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/questions", questionData));
  },

  updateQuestion: async (questionId, questionData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/questions/${questionId}`, questionData));
  },

  deleteQuestion: async (questionId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/questions/${questionId}`));
  },

  questionExists: async (questionId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/questions/${questionId}/exists`));
  },

  // ----- Option endpoints -----
  getAllOptions: async () => {
    const client = await createApiClient();
    return handleRequest(client.get("/options"));
  },

  getOptionById: async (optionId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/options/${optionId}`));
  },

  getOptionsByQuestionId: async (questionId) => {
    const client = await createApiClient();
    return handleRequest(client.get(`/options/byQuestion/${questionId}`));
  },

  createOption: async (optionData) => {
    const client = await createApiClient();
    return handleRequest(client.post("/options", optionData));
  },

  updateOption: async (optionId, optionData) => {
    const client = await createApiClient();
    return handleRequest(client.put(`/options/${optionId}`, optionData));
  },

  deleteOption: async (optionId) => {
    const client = await createApiClient();
    return handleRequest(client.delete(`/options/${optionId}`));
  },

  lockOption: async (optionId) => {
    const client = await createApiClient();
    return handleRequest(client.patch(`/options/${optionId}/lock`));
  },

  unlockOption: async (optionId) => {
    const client = await createApiClient();
    return handleRequest(client.patch(`/options/${optionId}/unlock`));
  },
  // ----- Survey Response endpoint -----
  submitSurveyResponse: async (surveyResponseDto) => {
    const client = await createApiClient();
    return handleRequest(client.post("/survey-response", surveyResponseDto));
  },

  getAllSurveyResponses: async () => {
  const client = await createApiClient();
  return handleRequest(client.get("/survey-response"));
},

getSurveyResponseById: async (id) => {
  const client = await createApiClient();
  return handleRequest(client.get(`/survey-response/${id}`));
},

updateSurveyResponse: async (id, surveyResponseDto) => {
  const client = await createApiClient();
  return handleRequest(client.put(`/survey-response/${id}`, surveyResponseDto));
},





};
