import React, { Suspense, lazy } from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./config/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { PATHS } from "./routes/paths";
import { PageLoader, Toaster } from "./ui";
import "./index.css";

const AuthPage = lazy(() => import("./pages/Login/AuthPage"));
const DashboardDefault = lazy(() => import("./pages/Dashboard"));
const KoiCompatibilityForm = lazy(
  () => import("./pages/KoiCompatible/KoiCompatibilityForm")
);
const UserProfile = lazy(() => import("./pages/UserProfile/UserProfile"));
const AdminFAQ = lazy(() => import("./pages/FAQ/FAQManager.jsx"));
const AdminPost = lazy(() => import("./pages/AdminPost/AdminPost"));
const BlogPage = lazy(() => import("./pages/AdminPost/BlogPage"));
const HomePage = lazy(() => import("./pages/Homepage/Homepage"));
const DetailPage = lazy(() => import("./pages/DetailPage/DetailPage.jsx"));
const DecorationPage = lazy(
  () => import("./pages/DecorationPage/DecorationPage")
);
const PostListingPage = lazy(() => import("./pages/PostListing/PostListingPage"));
const KoiListingsPage = lazy(
  () => import("./pages/KoiListingPage/KoiListingPage")
);
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const guarded = (node, role = null) =>
  role === null ? (
    <ProtectedRoute>{node}</ProtectedRoute>
  ) : (
    <ProtectedRoute requiredRole={role}>{node}</ProtectedRoute>
  );

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path={PATHS.auth} element={<AuthPage />} />
                <Route
                  path={PATHS.dashboard}
                  element={guarded(<DashboardDefault />, 1)}
                />
                <Route path={PATHS.home} element={<HomePage />} />
                <Route
                  path={PATHS.koiCompatible}
                  element={<KoiCompatibilityForm />}
                />
                <Route path={PATHS.profile} element={guarded(<UserProfile />)} />
                <Route
                  path={PATHS.details()}
                  element={<DetailPage />}
                />
                <Route
                  path={PATHS.decoration()}
                  element={<DecorationPage />}
                />
                <Route
                  path={PATHS.listingPost}
                  element={guarded(<PostListingPage />)}
                />
                <Route
                  path={PATHS.koiListings}
                  element={<KoiListingsPage />}
                />
                <Route
                  path={PATHS.faqManager}
                  element={guarded(<AdminFAQ />, 1)}
                />
                <Route
                  path={PATHS.adminPost}
                  element={guarded(<AdminPost />, 1)}
                />
                <Route path={PATHS.blog} element={<BlogPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
        <Toaster />
      </AuthProvider>
    </StyledEngineProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
