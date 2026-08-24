import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../components/GoogleIcon";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { googleLogin, getProfileStatus } from "../../api/auth";
import { extractApiError } from "../../api/core";
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
      const res = await googleLogin(tokenResponse.access_token);
      const { id, fullName, email, token, refreshToken, expiresInMinutes } =
        res.data;

      login({ token, refreshToken, expiresInMinutes, id, fullName, email });

      const status = await getProfileStatus();
      if (status.data?.requiresProfileCompletion) {
        notify.info("Vui lòng hoàn thiện hồ sơ để tiếp tục.");
        navigate(`${PATHS.profile}?onboarding=1`);
        return;
      }

      navigate(PATHS.home);
    } catch (err) {
      const apiError = extractApiError(err);
      console.error("Google login failed:", apiError.code, apiError.status);
      const message =
        apiError.message ||
        "Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.";
      setError(message);
      notify.error(message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const googleLoginFlow = useGoogleLogin({
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
        onClick={() => googleLoginFlow()}
      >
        <GoogleIcon />
        {loadingGoogle ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
      </Button>
    </div>
  );
}
