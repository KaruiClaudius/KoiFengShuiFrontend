import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Button from "@mui/joy/Button";
import GoogleIcon from "../../components/GoogleIcon";
import api from "../../config/axios";
import { Alert } from "@mui/joy";

export default function GoogleLoginButton() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setLoadingGoogle(true);
    setError(null);
    try {
      console.log("Google Access Token:", tokenResponse.access_token);
      const res = await api.post("/api/auth/google-login", {
        accessToken: tokenResponse.access_token,
      });
      console.log("Login successful", res.data);

      // Store the token
      localStorage.setItem("token", res.data.token);

      // Fetch user details
      const userDetailsResponse = await api.get(
        `api/Account/email/${res.data.email}`,
        {
          headers: { Authorization: `Bearer ${res.data.token}` },
        }
      );
      const userDetails = userDetailsResponse.data;

      // Store user details in localStorage
      localStorage.setItem("user", JSON.stringify(userDetails));
      localStorage.setItem("email", res.data.email); // Store email separately for consistency

      // Set the token in the default Authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      // Redirect to the home page or dashboard
      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      console.error("Error response:", error.response);
      setError(
        error.response?.data?.message || "An error occurred during Google login"
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: (error) => {
      console.error("Google login failed", error);
      setError("Google login failed. Please try again.");
    },
  });

  return (
    <>
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="soft"
        color="neutral"
        fullWidth
        startDecorator={<GoogleIcon />}
        disabled={loadingGoogle}
        onClick={() => login()}
      >
        {loadingGoogle ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
      </Button>
    </>
  );
}
