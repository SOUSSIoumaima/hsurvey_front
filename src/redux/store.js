import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import organizationReducer from "./slices/organizationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
