import axios from "axios";
import { getApiBaseUrl } from "./apiService";

async function createApiClient() {
  const baseURL = await getApiBaseUrl();
  return axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });
}

async function createOpenApiClient() {
  const baseURL = await getApiBaseUrl();
  return axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });
}

export const authService = {
  login: async (credentials) => {
    const openApiClient = await createOpenApiClient();
    try {
      const response = await openApiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerUserForNewOrg: async (orgId, userData) => {
    const openApiClient = await createOpenApiClient();
    try {
      const response = await openApiClient.post(
        `/auth/register/${orgId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerUserForExistingOrg: async (userData) => {
    const openApiClient = await createOpenApiClient();
    try {
      const response = await openApiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    const apiClient = await createApiClient();
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Try to refresh token
        try {
          await authService.refreshToken();
          // Retry /auth/me
          const retryResponse = await apiClient.get("/auth/me");
          return retryResponse.data;
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  },

  logout: async () => {
    const apiClient = await createApiClient();
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout failed:", error);
    }
  },
};
