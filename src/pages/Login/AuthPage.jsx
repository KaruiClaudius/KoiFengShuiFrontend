import * as React from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import { useNavigate } from "react-router-dom";
// import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
// import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "../../GoogleIcon";
import api from "../../config/axios";

function ColorSchemeToggle(props) {
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
}

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
        src="https://scontent.fsgn20-1.fna.fbcdn.net/v/t39.30808-6/460535538_122105294522523904_2461728936276430116_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=sOcqU-oVd_gQ7kNvgE-YNu6&_nc_ht=scontent.fsgn20-1.fna&_nc_gid=AiovkpM2EY65PFsglqEFYdO&oh=00_AYAWBfXjRqpBiDpTpEx49F5L4bxesCZ7aSSWsSkj__ZP-g&oe=66F2EF86"
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
    const formElements = event.currentTarget.elements;
    let data;
    switch (authMode) {
      case "signin":
        data = {
          email: formElements.email.value,
          password: formElements.password.value,
          persistent: formElements.persistent?.checked,
        };
        // handle Login here
        try {
          const response = await api.post("login", {
            email: data.email,
            password: data.password,
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
        data = {
          name: formElements.name.value,
          email: formElements.email.value,
          password: formElements.password.value,
          confirmPassword: formElements.confirmPassword.value,
          terms: formElements.terms.checked,
        };
        break;
      case "forgotpassword":
        data = {
          email: formElements.email.value,
        };
        break;
    }
    alert(JSON.stringify(data, null, 2));
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
                UNINEST
              </Button>
            </Box>
            <ColorSchemeToggle />
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
                    ? "Sign in"
                    : authMode === "signup"
                    ? "Sign up"
                    : "Forgot Password"}
                </Typography>
                {authMode !== "forgotpassword" && (
                  <Typography level="body-sm">
                    {authMode === "signin"
                      ? "Don't have an account yet? "
                      : "Already have an account? "}
                    <Link
                      component="button"
                      level="title-sm"
                      onClick={() =>
                        toggleAuthMode(
                          authMode === "signin" ? "signup" : "signin"
                        )
                      }
                    >
                      {authMode === "signin" ? "Sign up!" : "Sign in!"}
                    </Link>
                  </Typography>
                )}
                {authMode === "forgotpassword" && (
                  <Typography level="body-sm">
                    Enter your email address and we'll send you a link to reset
                    your password.
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
                  Continue with Google
                </Button>
              )}
            </Stack>
            {authMode === "signin" && <Divider>or</Divider>}
            <Stack sx={{ gap: 4, mt: 2 }}>
              <form onSubmit={handleSubmit}>
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Name</FormLabel>
                    <Input type="text" name="name" />
                  </FormControl>
                )}
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" />
                </FormControl>
                {authMode !== "forgotpassword" && (
                  <FormControl required>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" name="password" />
                  </FormControl>
                )}
                {authMode === "signup" && (
                  <FormControl required>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input type="password" name="confirmPassword" />
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
                      <Checkbox
                        size="sm"
                        label="Remember me"
                        name="persistent"
                      />
                      <Link
                        level="title-sm"
                        component="button"
                        onClick={() => toggleAuthMode("forgotpassword")}
                      >
                        Forgot your password?
                      </Link>
                    </Box>
                  )}
                  {authMode === "signup" && (
                    <Checkbox
                      size="sm"
                      label="I agree to the terms and conditions"
                      name="terms"
                    />
                  )}
                  <Button type="submit" fullWidth>
                    {authMode === "signin"
                      ? "Sign in"
                      : authMode === "signup"
                      ? "Sign up"
                      : "Reset Password"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: "center" }}>
              © Your company {new Date().getFullYear()}
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
            "url(https://scontent.fsgn20-1.fna.fbcdn.net/v/t1.15752-9/460598464_534420082301265_6938301985852954232_n.png?_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeG37PdF0oLrKQzcFnoE1ptvqbY7IRP2WlaptjshE_ZaVi3VGqdMSXszQV29VjqKKlF3bzi6mKGA0VvKwVnR4ZRM&_nc_ohc=mm0qeprZUxMQ7kNvgGX5iTV&_nc_ht=scontent.fsgn20-1.fna&_nc_gid=AhhEhXd_XZ-VB48tNoTP19f&oh=03_Q7cD1QELVBYJq9nQMuFgkCCTsUBVMq7yuJxPfYrWu2ZuHXk9bQ&oe=6715B658)",
        })}
      />
    </CssVarsProvider>
  );
}
