// Role checking utilities
export const isManager = (user) => {
  if (!user) {
    return false;
  }
  if (!user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some(
    (role) =>
      role === "ORGANIZATION MANAGER" ||
      role === "DEPARTMENT MANAGER" ||
      role === "TEAM MANAGER"
  );
};

export const isOrganizationManager = (user) => {
  if (!user || !user.roles) return false;
  return user.roles.includes("ORGANIZATION MANAGER");
};

export const isDepartmentManager = (user) => {
  if (!user || !user.roles) return false;
  return user.roles.includes("DEPARTMENT MANAGER");
};

export const isTeamManager = (user) => {
  if (!user || !user.roles) return false;
  return user.roles.includes("TEAM MANAGER");
};

export const getUserRole = (user) => {
  if (!user || !user.roles) return "USER";

  if (user.roles.includes("ORGANIZATION MANAGER"))
    return "ORGANIZATION MANAGER";
  if (user.roles.includes("DEPARTMENT MANAGER")) return "DEPARTMENT MANAGER";
  if (user.roles.includes("TEAM MANAGER")) return "TEAM MANAGER";

  return "USER";
};

export const shouldRedirectToDashboard = (user) => {
  return isManager(user);
};
