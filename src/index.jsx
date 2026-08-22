import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";

// Import page here
import AuthPage from "./pages/Login/AuthPage";
import DashboardDefault from "./pages/Dashboard";
import KoiCompatibilityForm from "./pages/KoiCompatible/KoiCompatibilityForm";
import UserProfile from "./pages/UserProfile/UserProfile";
import ProtectedRoute from "./config/ProtectedRoute";
import AdminFAQ from "./pages/FAQ/FAQManager.jsx";
import AdminPost from "./pages/AdminPost/AdminPost";
import BlogPage from "./pages/AdminPost/BlogPage";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound/NotFound";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//import Homepage, Detail Page
import HomePage from "./pages/Homepage/Homepage";
import DetailPage from "./pages/DetailPage/DetailPage.jsx";
import DecorationPage from "./pages/DecorationPage/DecorationPage";
import PostListingPage from "./pages/PostListing/PostListingPage";
import KoiListingsPage from "./pages/KoiListingPage/KoiListingPage";
const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <ErrorBoundary>
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
            <Route path="/Details/:id" element={<DetailPage />} />
            <Route path="/Decoration/:id" element={<DecorationPage />} />
            <Route path="/ListingPost" element={<PostListingPage />} />
            <Route path="/KoiListings" element={<KoiListingsPage />} />
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </StyledEngineProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
