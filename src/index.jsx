import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";

// Import page here
import AuthPage from "./pages/Login/AuthPage";
import DashboardDefault from "./pages/Dashboard";
import KoiCompatibilityForm from "./pages/KoiCompatible/KoiCompatibilityForm ";
import UserProfile from "./pages/UserProfile/UserProfile";
import ProtectedRoute from "./config/ProtectedRoute";
// import PaymentMethod from "./pages/Payment/Payment";
import AdminFAQ from "./pages/FAQ/FAQManager.jsx";
import AdminPost from "./pages/AdminPost/AdminPost";
import "./index.css";

// import LandingPage from "./pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//import Homepage, Detail Page
import HomePage from "./pages/Homepage/Homepage";
import KoiDetailPage from "./pages/KoiDetailPage/KoiDetailPage";
import DecorationPage from "./pages/DecorationPage/DecorationPage";
import PostListingPage from "./pages/PostListing/PostListingPage.jsx";
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
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/KoiDetails/:id" element={<KoiDetailPage />} />
          <Route path="/Decoration/:id" element={<DecorationPage />} />
          <Route path="/ListingPost" element={<PostListingPage />} />
          {/* <Route path="/Decoration/:id" element={<DecorationPage />} /> */}
          <Route
            path="/FAQManager"
            element={
              <ProtectedRoute requiredRole={1}>
                <AdminFAQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminPost"
            element={
              <ProtectedRoute requiredRole={1}>
                <AdminPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/payment" element={<PaymentMethod />} /> */}
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
