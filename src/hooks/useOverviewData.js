import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { isDepartmentManager, isTeamManager } from "../utils/roleUtils";

export const useOverviewData = (currentUser) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Always load basic data that all roles need
      const basicDataPromises = [
        loadOrganization(),
        loadSurveys(),
        loadQuestions(),
        loadSurveyResponses(),
      ];

      // Add role-specific data
      if (isDepartmentManager(currentUser)) {
        // DEPARTMENT MANAGER: needs departments, teams, users (for department management)
        basicDataPromises.push(loadDepartments(), loadTeams(), loadUsers());
      } else if (isTeamManager(currentUser)) {
        // TEAM MANAGER: needs teams, users (for team management)
        basicDataPromises.push(loadTeams(), loadUsers());
      } else {
        // ORGANIZATION MANAGER: needs everything
        basicDataPromises.push(
          loadDepartments(),
          loadTeams(),
          loadUsers(),
          loadRoles(),
          loadPermissions()
        );
      }

      await Promise.all(basicDataPromises);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // API Functions
  const loadOrganization = async () => {
    try {
      if (!currentUser || !currentUser.organizationId) return;
      const data = await apiService.getCurrentOrganization(
        currentUser.organizationId
      );
      setOrganizations([data]);
    } catch (err) {
      console.error("Failed to load organization:", err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadSurveys = async () => {
    try {
      const data = await apiService.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      console.error("Failed to load surveys:", err);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await apiService.getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error("Failed to load permissions:", err);
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await apiService.getAllQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  };

  const loadSurveyResponses = async () => {
    try {
      const data = await apiService.getSurveyResponses();
      setSurveyResponses(data);
    } catch (err) {
      console.error("Failed to load survey responses:", err);
    }
  };

  return {
    loading,
    error,
    organizations,
    departments,
    teams,
    users,
    surveys,
    roles,
    permissions,
    questions,
    surveyResponses,
    reload: loadDashboardData,
  };
};
