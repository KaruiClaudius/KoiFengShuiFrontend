import * as React from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
// import Checkbox from "@mui/joy/Checkbox";
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
// import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
// import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "../../GoogleIcon";
import api from "../../config/axios";
import KoiBackGround from "../../assets/KoiBackGround.svg";

// function ColorSchemeToggle(props) {
// const { onClick, ...other } = props;
// const { mode, setMode } = useColorScheme();
// const [mounted, setMounted] = React.useState(false);
// React.useEffect(() => setMounted(true), []);
// return (
//   <IconButton
//     aria-label="toggle light/dark mode"
//     size="sm"
//     variant="outlined"
//     disabled={!mounted}
//     onClick={(event) => {
//       setMode(mode === "light" ? "dark" : "light");
//       onClick?.(event);
//     }}
//     {...other}
//   >
//     {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
//   </IconButton>
// );
// }

const customTheme = extendTheme({ defaultColorScheme: "dark" });

export default function AuthPage() {
  const [authMode, setAuthMode] = React.useState("signin");
  // 'signin', 'signup', or 'forgotpassword'

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
  };

  const CompanyLogoButton = () => (
    <IconButton sx={{ padding: 2, width: 64, height: 64 }}>
      <img
        src={KoiBackGround}
        alt="Company Logo"
        style={{
          width: 64,
          height: 64,
          objectFit: "contain",
        }}
      />
    </IconButton>
  );

  const navigate = useNavigate();
  // const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleHomeClick = () => {
    navigate("/homepage");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // let data;
    switch (authMode) {
      case "signin":
        // data = {
        //   email: formData.get("email"),
        //   password: formData.get("password"),
        //   persistent: formData.get("persistent") === "on",
        // };

        // handle Login here
        try {
          const response = await api.post("Account/authenticate", {
            email: formData.get("email"),
            password: formData.get("password"),
          });
          const { token } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(response.data));
          navigate("/");
        } catch (err) {
          console.log(err);
          alert(err.response?.data || "An error occurred during login");
        }

        break;
      case "signup":
        // data = {
        //   fullName: formData.get("fullName"),
        //   email: formData.get("email"),
        //   password: formData.get("password"),
        //   doB: formData.get("doB"),
        //   phone: formData.get("phone"),
        //   gender: formData.get("gender"),
        //   terms: formData.get("terms") === "on",
        // };

        // handle SignUp
        try {
          await api.post("Account/register", {
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
          alert(err.response?.data || "An error occurred during Sign Up");
        }

        break;

      case "forgotpassword":
        // data = {
        //   email: formData.get("email"),
        // };
        // handle forgot password

        try {
          await api.post("Account/ForgotPassword", {
            email: formData.get("email"),
          });
          toggleAuthMode("signin");
        } catch (err) {
          console.error(err);
          alert(
            err.response?.data || "An error occured during Forgot Password"
          );
        }

        break;
    }
    // alert(JSON.stringify(data, null, 2));
  };

  return (
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
              {/* <CompanyLogoButton /> */}
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
            {/* <ColorSchemeToggle /> */}
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
              {authMode === "signin" && (
                <Button
                  variant="soft"
                  color="neutral"
                  fullWidth
                  startDecorator={<GoogleIcon />}
                >
                  Google
                </Button>
              )}
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
                  {/* {authMode === "signup" && (
                    <Checkbox
                      size="sm"
                      label="I agree to the terms and conditions"
                      name="terms"
                    />
                  )} */}
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
  );
}
