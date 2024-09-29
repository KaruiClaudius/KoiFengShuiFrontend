import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";

// Import page here
import AuthPage from "./pages/Login/AuthPage";
import DashboardDefault from "./pages/Dashboard";
import HomePage from "./pages/Homepage/Homepage";
import KoiCompatibilityForm from "./pages/KoiCompatible/KoiCompatibilityForm ";
// import LandingPage from "./pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          {/* <Route path="/homepage" element={<LandingPage />} /> */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/Dashboard" element={<DashboardDefault />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/KoiCompatible" element={<KoiCompatibilityForm />} />
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
