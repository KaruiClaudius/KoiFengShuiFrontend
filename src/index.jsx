import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";

// Import page here
import AuthPage from "./pages/Login/AuthPage";
import DashboardDefault from "./pages/Dashboard";
import HomePage from "./pages/Homepage/Homepage";
import KoiCompatibilityForm from "./pages/KoiCompatible/KoiCompatibilityForm ";
import UserProfile from "./pages/UserProfile/UserProfile";
import ProtectedRoute from "./config/ProtectedRoute";

import "./index.css";

// import LandingPage from "./pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute requiredRole={1}>
                <DashboardDefault />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
          <Route path="/KoiCompatible" element={<KoiCompatibilityForm />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </StyledEngineProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
