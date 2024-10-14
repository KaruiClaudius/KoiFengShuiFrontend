import * as React from "react";
import { useState } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Stack from "@mui/joy/Stack";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../config/axios";
import KoiLogo from "../../assets/Logo_SWP.svg";
import GoogleLoginButton from "./GoogleLoginButton";
import { GoogleOAuthProvider } from "@react-oauth/google";

const customTheme = extendTheme({ defaultColorScheme: "dark" });

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("signin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
    setError(""); // Clear any existing error when switching modes
  };

  const CompanyLogoButton = () => (
    <IconButton sx={{ padding: 2, width: 98, height: 98 }}>
      <img
        src={KoiLogo}
        alt="Company Logo"
        style={{
          width: 90,
          height: 90,
          objectFit: "contain",
        }}
      />
    </IconButton>
  );

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear any existing error
    const formData = new FormData(event.currentTarget);

    switch (authMode) {
      case "signin":
        try {
          const response = await api.post("api/Auth/SignIn", {
            email: formData.get("email"),
            password: formData.get("password"),
          });
          const { token, email } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("email", email);

          // Fetch user details
          const userDetailsResponse = await api.get(
            `api/Account/email/${email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userDetails = userDetailsResponse.data;

          // Store user details in localStorage
          localStorage.setItem("user", JSON.stringify(userDetails));

          navigate("/");
        } catch (err) {
          console.log(err);
          if (err.response && err.response.status === 400) {
            if (err.response.data.message === "Email not found.") {
              setError("Email không tồn tại.");
            } else if (err.response.data.message === "Incorrect password.") {
              setError("Mật khẩu không đúng.");
            } else {
              setError(
                err.response.data.message ||
                  "Đăng nhập thất bại. Vui lòng thử lại."
              );
            }
          } else {
            setError(
              "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau."
            );
          }
        }
        break;
      case "signup":
        try {
          await api.post("api/Auth/SignUp", {
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            password: formData.get("password"),
            doB: formData.get("doB"),
            phone: formData.get("phone"),
            gender: formData.get("gender"),
            terms: formData.get("terms") === "on",
          });
          toggleAuthMode("signin");
        } catch (err) {
          console.error(err);
          setError(
            err.response?.data ||
              "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại."
          );
        }
        break;
      case "forgotpassword":
        try {
          await api.post("api/Auth/ForgotPassword", {
            email: formData.get("email"),
          });
          toggleAuthMode("signin");
        } catch (err) {
          console.error(err);
          setError(
            err.response?.data ||
              "Đã xảy ra lỗi trong quá trình khôi phục mật khẩu. Vui lòng thử lại."
          );
        }
        break;
    }
  };

  return (
    <GoogleOAuthProvider clientId="910517568057-gbk894g908blesmb6v6oa64ida68co4b.apps.googleusercontent.com">
      <CssVarsProvider theme={customTheme} disableTransitionOnChange>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ":root": {
              "--Form-maxWidth": "800px",
              "--Transition-duration": "0.4s",
            },
          }}
        />
        <Box
          sx={(theme) => ({
            width: { xs: "100%", md: "50vw" },
            transition: "width var(--Transition-duration)",
            transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "flex-end",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(255 255 255 / 0.2)",
            [theme.getColorSchemeSelector("dark")]: {
              backgroundColor: "rgba(19 19 24 / 0.4)",
            },
          })}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100dvh",
              width: "100%",
              px: 2,
            }}
          >
            <Box
              component="header"
              sx={{ py: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
                <Button
                  variant="plain"
                  startDecorator={<CompanyLogoButton />}
                  size="lg"
                  color="neutral"
                  onClick={handleHomeClick}
                >
                  Koi Feng Shui
                </Button>
              </Box>
            </Box>
            <Box
              component="main"
              sx={{
                my: "auto",
                py: 2,
                pb: 5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: 400,
                maxWidth: "100%",
                mx: "auto",
                borderRadius: "sm",
                "& form": {
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                },
                [`& .MuiFormLabel-asterisk`]: {
                  visibility: "hidden",
                },
              }}
            >
              <Stack sx={{ gap: 4, mb: 2 }}>
                <Stack sx={{ gap: 1 }}>
                  {authMode === "forgotpassword" && (
                    <IconButton
                      onClick={() => toggleAuthMode("signin")}
                      sx={{ alignSelf: "flex-start", mb: 1 }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Typography component="h1" level="h3">
                    {authMode === "signin"
                      ? "Đăng nhập"
                      : authMode === "signup"
                      ? "Đăng kí"
                      : authMode === "forgotpassword"
                      ? "Quên mật khẩu"
                      : ""}
                  </Typography>
                  {authMode !== "forgotpassword" && (
                    <Typography level="body-sm">
                      {authMode === "signin"
                        ? "Chưa có tài khoản ? "
                        : "Đã có tài khoản ? "}
                      <Link
                        component="button"
                        level="title-sm"
                        onClick={() =>
                          toggleAuthMode(
                            authMode === "signin" ? "signup" : "signin"
                          )
                        }
                      >
                        {authMode === "signin"
                          ? "Đăng kí tài khoản mới !"
                          : "Đăng nhập ngay !"}
                      </Link>
                    </Typography>
                  )}
                  {authMode === "forgotpassword" && (
                    <Typography level="body-sm">
                      Điền Email để chúng tôi gửi mật khẩu mới cho bạn
                    </Typography>
                  )}
                </Stack>
                {authMode === "signin" && <GoogleLoginButton />}
              </Stack>
              {authMode === "signin" && <Divider>Hoặc đăng nhập bằng</Divider>}

              <Stack sx={{ gap: 4, mt: 2 }}>
                <form onSubmit={handleSubmit}>
                  {authMode === "signup" && (
                    <FormControl required>
                      <FormLabel>Họ và tên</FormLabel>
                      <Input type="text" name="fullName" />
                    </FormControl>
                  )}
                  <FormControl required>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" name="email" />
                  </FormControl>
                  {authMode !== "forgotpassword" && (
                    <FormControl required>
                      <FormLabel>Mật khẩu</FormLabel>
                      <Input type="password" name="password" />
                    </FormControl>
                  )}
                  {authMode === "signup" && (
                    <FormControl required>
                      <FormLabel>Năm sinh</FormLabel>
                      <Input type="date" name="doB" />
                    </FormControl>
                  )}
                  {authMode === "signup" && (
                    <FormControl required>
                      <FormLabel>Số điện thoại</FormLabel>
                      <Input type="text" name="phone" />
                    </FormControl>
                  )}
                  {authMode === "signup" && (
                    <FormControl required>
                      <FormLabel>Giới tính</FormLabel>
                      <Select defaultValue="gender" name="gender">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </FormControl>
                  )}
                  {error && (
                    <Typography
                      color="danger"
                      fontSize="sm"
                      sx={{ mt: 1, mb: 2 }}
                    >
                      {error}
                    </Typography>
                  )}
                  <Stack sx={{ gap: 4, mt: 2 }}>
                    {authMode === "signin" && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          level="title-sm"
                          component="button"
                          alignItems="flex-end"
                          onClick={() => toggleAuthMode("forgotpassword")}
                        >
                          Quên mật khẩu
                        </Link>
                      </Box>
                    )}
                    <Button type="submit" fullWidth>
                      {authMode === "signin"
                        ? "Đăng nhập"
                        : authMode === "signup"
                        ? "Đăng kí"
                        : "Tiếp tục"}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Box>
            <Box component="footer" sx={{ py: 3 }}>
              <Typography level="body-xs" sx={{ textAlign: "center" }}>
                © Koi Feng Shui {new Date().getFullYear()}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={() => ({
            height: "100%",
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            left: { xs: 0, md: "50vw" },
            transition:
              "background-image var(--Transition-duration), left var(--Transition-duration) !important",
            transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
            backgroundColor: "background.level1",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundImage:
              "url(https://img.freepik.com/free-vector/carp-fish-waves-vector-blue-background-featuring-public-domain-artworks_53876-146335.jpg?t=st=1727224826~exp=1727228426~hmac=18dcb7e1a02c72975ffc6a4a1c1bfb6d7e9f50a340bcf1e81b907b4631ff63b8&w=996)",
          })}
        />
      </CssVarsProvider>
    </GoogleOAuthProvider>
  );
}
