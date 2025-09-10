import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const autoLogin = createAsyncThunk(
  "auth/autoLogin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        return { user: response };
      } else {
        return rejectWithValue("Session expired");
      }
    } catch (error) {
      localStorage.removeItem("authState");
      return rejectWithValue(
        "Session verification and refresh failed. Please log in again."
      );
    }
  }
);

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

export const registerUserForNewOrg = createAsyncThunk(
  "auth/registerUserForNewOrg",
  async ({ orgId, userData }, { rejectWithValue }) => {
    try {
      const response = await authService.registerUserForNewOrg(orgId, userData);
      return response;
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

export const registerUserForExistingOrg = createAsyncThunk(
  "auth/registerUserForExistingOrg",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.registerUserForExistingOrg(userData);
      return response;
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          "An error occurred";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem("authState");
      return "Logged out successfully";
    } catch (err) {
      localStorage.removeItem("authState");
      return "Logged out successfully";
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    errorLogin: null,
    errorRegisterNewOrg: null,
    errorRegisterExistingOrg: null,
    isInitialized: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.errorLogin = null;
      state.errorRegisterNewOrg = null;
      state.errorRegisterExistingOrg = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.errorLogin = null;
      state.errorRegisterNewOrg = null;
      state.errorRegisterExistingOrg = null;
      state.isInitialized = false;
    },
    clearAuthErrors: (state) => {
      state.errorLogin = null;
      state.errorRegisterNewOrg = null;
      state.errorRegisterExistingOrg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(autoLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(autoLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload.user) {
          const user = action.payload.user;
          // Keep the roles array as-is, don't modify it
          state.user = user;
        }
      })
      .addCase(autoLogin.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.errorLogin = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        let userData;
        if (action.payload.user) {
          userData = action.payload.user;
          // Keep the roles array as-is, don't modify it
          state.user = userData;
        } else {
          userData = {
            username: action.payload.username,
            organizationId: action.payload.organizationId,
            roles: action.payload.roles,
          };
          state.user = userData;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.errorLogin = action.payload || action.error.message;
      })
      .addCase(registerUserForNewOrg.pending, (state) => {
        state.loading = true;
        state.errorRegisterNewOrg = null;
      })
      .addCase(registerUserForNewOrg.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload && action.payload.username) {
          state.user = {
            username: action.payload.username,
            organizationId: action.payload.organizationId,
            roles: action.payload.roles,
          };
        }
      })
      .addCase(registerUserForNewOrg.rejected, (state, action) => {
        state.loading = false;
        state.errorRegisterNewOrg = action.payload || action.error.message;
      })
      .addCase(registerUserForExistingOrg.pending, (state) => {
        state.loading = true;
        state.errorRegisterExistingOrg = null;
      })
      .addCase(registerUserForExistingOrg.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload && action.payload.username) {
          state.user = {
            username: action.payload.username,
            organizationId: action.payload.organizationId,
            roles: action.payload.roles,
          };
        }
      })
      .addCase(registerUserForExistingOrg.rejected, (state, action) => {
        state.loading = false;
        state.errorRegisterExistingOrg = action.payload || action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.errorLogin = null;
        state.errorRegisterNewOrg = null;
        state.errorRegisterExistingOrg = null;
      });
  },
});

export const { logout, resetAuth, clearAuthErrors } = authSlice.actions;
export default authSlice.reducer;