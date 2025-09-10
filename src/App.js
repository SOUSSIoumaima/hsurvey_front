import React, { useEffect } from "react";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { store } from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { autoLogin } from "./redux/slices/authSlice";
import { shouldRedirectToDashboard } from "./utils/roleUtils";

import AuthSystem from "./components/auth/AuthSystem";
import Dashboard from "./pages/Dashboard";
import UserHome from "./pages/UserHome";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import SurveyPage from "./pages/SurveyPage";

// App Routes Component (needs to be inside Provider)
const AppRoutes = () => {
  const dispatch = useDispatch();
  const { user, isInitialized } = useSelector((state) => state.auth);

  // Auto-login on app start
  useEffect(() => {
    dispatch(autoLogin());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

const getRedirectPath = () => {
  if (user) {
    // Check if user has admin roles
    const isAdmin =
      user.roles &&
      user.roles.some(
        (role) =>
          role === "ORGANIZATION MANAGER" ||
          role === "DEPARTMENT MANAGER" ||
          role === "TEAM MANAGER" ||
          role === "ADMIN" ||
          role === "admin"
      );
    return isAdmin ? "/dashboard" : "/user-home";
  }
  return "/";
};
  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to={getRedirectPath()} replace /> : <AuthSystem />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-home"
        element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        }
      />
       <Route
      path="/survey/:surveyId"
      element={
        <ProtectedRoute>
          <SurveyPage />
        </ProtectedRoute>
      }
    />
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
