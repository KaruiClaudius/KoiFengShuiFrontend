import React, { Suspense, lazy, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./config/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { PATHS } from "./routes/paths";
import PublicShell from "./layout/PublicShell";
import AdminShell from "./layout/AdminShell";
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

const titleFor = (pathname) => {
  if (pathname.startsWith("/Details/")) return "Chi tiết cá Koi";
  if (pathname.startsWith("/Decoration/")) return "Đồ trang trí hồ cá";
  const map = {
    [PATHS.home]: "Trang chủ",
    [PATHS.koiListings]: "Cá Koi",
    [PATHS.koiCompatible]: "Tư vấn bản mệnh",
    [PATHS.listingPost]: "Đăng tin",
    [PATHS.profile]: "Tài khoản",
    [PATHS.blog]: "Kinh nghiệm hay",
    [PATHS.auth]: "Đăng nhập",
    [PATHS.dashboard]: "Dashboard",
    [PATHS.adminPost]: "Quản lý bài viết",
    [PATHS.faqManager]: "Quản lý FAQ",
  };
  const page = map[pathname];
  return page ? `${page} · Koi FengShui` : "Koi FengShui — Cá Koi & Phong Thủy";
};

const TitleManager = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <TitleManager />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={PATHS.auth} element={<AuthPage />} />
              <Route element={<AdminShell />}>
                <Route
                  path={PATHS.dashboard}
                  element={guarded(<DashboardDefault />, 1)}
                />
                <Route
                  path={PATHS.faqManager}
                  element={guarded(<AdminFAQ />, 1)}
                />
                <Route
                  path={PATHS.adminPost}
                  element={guarded(<AdminPost />, 1)}
                />
              </Route>
              <Route path={PATHS.profile} element={guarded(<UserProfile />)} />
              <Route element={<PublicShell />}>
                <Route path={PATHS.home} element={<HomePage />} />
                <Route
                  path={PATHS.koiCompatible}
                  element={<KoiCompatibilityForm />}
                />
                <Route
                  path={PATHS.listingPost}
                  element={guarded(<PostListingPage />)}
                />
                <Route
                  path={PATHS.koiListings}
                  element={<KoiListingsPage />}
                />
                <Route path={PATHS.details()} element={<DetailPage />} />
                <Route
                  path={PATHS.decoration()}
                  element={<DecorationPage />}
                />
                <Route path={PATHS.blog} element={<BlogPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
