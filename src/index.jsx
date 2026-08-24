import React, { Suspense, lazy, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./config/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PATHS } from "./routes/paths";
import PublicShell from "./layout/PublicShell";
import AdminShell from "./layout/AdminShell";
import { PageLoader, Toaster } from "./ui";
import "./index.css";

const AuthPage = lazy(() => import("./pages/Login/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/Auth/ResetPasswordPage"));
const DashboardDefault = lazy(() => import("./pages/Dashboard"));
const KoiCompatibilityForm = lazy(
  () => import("./pages/KoiCompatible/KoiCompatibilityForm")
);
const UserProfile = lazy(() => import("./pages/UserProfile/UserProfile"));
const AdminFAQ = lazy(() => import("./pages/FAQ/FAQManager.jsx"));
const AdminPost = lazy(() => import("./pages/AdminPost/AdminPost"));
const BlogPage = lazy(() => import("./pages/AdminPost/BlogPage"));
const HomePage = lazy(() => import("./pages/Homepage/Homepage"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const BlogDetail = lazy(() => import("./pages/BlogDetail/BlogDetail"));
const CommunityPage = lazy(() => import("./pages/Community/CommunityPage"));
const CommunitySubmitPage = lazy(
  () => import("./pages/Community/CommunitySubmitPage")
);
const CommunityMyPostsPage = lazy(
  () => import("./pages/Community/CommunityMyPostsPage")
);
const CommunityDetailPage = lazy(
  () => import("./pages/Community/CommunityDetailPage")
);
const PartnersPage = lazy(() => import("./pages/Partners/PartnersPage"));
const AdminPartnersPage = lazy(
  () => import("./pages/Partners/AdminPartnersPage")
);

const guarded = (node, role = null) =>
  role === null ? (
    <ProtectedRoute>{node}</ProtectedRoute>
  ) : (
    <ProtectedRoute requiredRole={role}>{node}</ProtectedRoute>
  );

const titleFor = (pathname) => {
  const map = {
    [PATHS.home]: "Trang chủ",
    [PATHS.koiCompatible]: "Tư vấn bản mệnh",
    [PATHS.profile]: "Tài khoản",
    [PATHS.community]: "Cộng đồng",
    [PATHS.partners]: "Đối tác",
    [PATHS.communitySubmit]: "Chia sẻ bài viết",
    [PATHS.communityMyPosts]: "Bài của tôi",
    [PATHS.blog]: "Kinh nghiệm hay",
    [PATHS.auth]: "Đăng nhập",
    [PATHS.resetPassword]: "Đặt lại mật khẩu",
    [PATHS.dashboard]: "Dashboard",
    [PATHS.adminPost]: "Quản lý bài viết",
    [PATHS.faqManager]: "Quản lý FAQ",
  };
  const page = map[pathname];
  if (pathname.startsWith("/blog/") && !pathname.endsWith("/blog/")) {
    return "Bài viết · Koi FengShui";
  }
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
            <TitleManager />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path={PATHS.auth} element={<AuthPage />} />
                  <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
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
                    <Route
                      path={PATHS.adminPartners}
                      element={guarded(<AdminPartnersPage />, 1)}
                    />
                  </Route>
                  <Route
                    path={PATHS.profile}
                    element={guarded(<UserProfile />)}
                  />
                  <Route element={<PublicShell />}>
                    <Route path={PATHS.home} element={<HomePage />} />
                    <Route
                      path={PATHS.koiCompatible}
                      element={<KoiCompatibilityForm />}
                    />
                    <Route path={PATHS.blog} element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path={PATHS.community} element={<CommunityPage />} />
                    <Route
                      path={PATHS.communitySubmit}
                      element={guarded(<CommunitySubmitPage />)}
                    />
                    <Route
                      path={PATHS.communityMyPosts}
                      element={guarded(<CommunityMyPostsPage />)}
                    />
                    <Route
                      path="/community/:id"
                      element={<CommunityDetailPage />}
                    />
                    <Route path={PATHS.partners} element={<PartnersPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
  );
};
ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
