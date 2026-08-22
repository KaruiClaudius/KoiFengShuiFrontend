import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../components/GoogleIcon";
import api from "../../config/axios";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { Button, notify } from "../../ui";

export default function GoogleLoginButton() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/google-login", {
        accessToken: tokenResponse.access_token,
      });

      const userDetailsResponse = await api.get(
        `api/Account/email/${res.data.email}`
      );
      const userDetails = userDetailsResponse.data;

      login({
        newToken: res.data.token,
        newUser: userDetails,
        email: res.data.email,
      });

      navigate(PATHS.home);
    } catch (err) {
      console.error("Login failed", err);
      console.error("Error response:", err.response);
      const message =
        err.response?.data?.message ||
        "Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.";
      setError(message);
      notify.error(message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: (err) => {
      console.error("Google login failed:", err?.type || "unknown");
      const message = "Đăng nhập Google thất bại. Vui lòng thử lại.";
      setError(message);
      notify.error(message);
    },
  });

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-2 rounded-md border-crimson bg-crimson/10 p-3 text-sm text-crimson"
        >
          {error}
        </div>
      )}
      <Button
        variant="secondary"
        className="w-full"
        disabled={loadingGoogle}
        onClick={() => googleLogin()}
      >
        <GoogleIcon />
        {loadingGoogle ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
      </Button>
    </div>
  );
}
