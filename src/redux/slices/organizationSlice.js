import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { organizationService } from "../../services/organizationService";

export const createOrganization = createAsyncThunk(
  "organization/create",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await organizationService.createOrganization(orgData);
      return response;
    } catch (err) {
   
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    currentOrg: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrg = action.payload;
    },
    resetOrganization: (state) => {
      state.currentOrg = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrg = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setCurrentOrganization, resetOrganization } =
  organizationSlice.actions;
export default organizationSlice.reducer;
