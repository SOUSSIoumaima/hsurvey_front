import axios from "axios";
import { getApiBaseUrl } from "./apiService";

async function createOrgApiClient() {
  const baseURL = await getApiBaseUrl();
  return axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });
}

async function createOpenOrgApiClient() {
  const baseURL = await getApiBaseUrl();
  return axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export const organizationService = {
  createOrganization: async (orgData) => {
    const openOrgApiClient = await createOpenOrgApiClient();
    try {
      const response = await openOrgApiClient.post(
        "/organizations/register",
        orgData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentOrganization: async (organizationId) => {
    const orgApiClient = await createOrgApiClient();
    try {
      const response = await orgApiClient.get(
        `/organizations/${organizationId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDepartments: async () => {
    const orgApiClient = await createOrgApiClient();
    try {
      const response = await orgApiClient.get("/departments");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTeams: async () => {
    const orgApiClient = await createOrgApiClient();
    try {
      const response = await orgApiClient.get("/teams");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
