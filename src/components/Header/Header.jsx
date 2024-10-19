import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";

const AppHeader = () => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [elementName, setElementName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const elementMapping = {
    1: "Mộc",
    2: "Hoả",
    3: "Thổ",
    4: "Kim",
    5: "Thuỷ",
  };

  useEffect(() => {
    const updateUserData = (event) => {
      const updatedUser = event.detail;
      setUserData(updatedUser);
      setFullName(updatedUser.fullName);
      setUserRole(updatedUser.roleId);
      const elementName = updatedUser.elementId
        ? elementMapping[updatedUser.elementId]
        : "Unknown";
      setElementName(elementName);
      setAvatarUrl(
        `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
          updatedUser.fullName
        )}`
      );
    };

    // Add event listener
    window.addEventListener("userProfileUpdated", updateUserData);

    // Initial data load
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      updateUserData({ detail: user });
    }
    setIsLoggedIn(!!token);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("userProfileUpdated", updateUserData);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setFullName("");

    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const sellingFishClick = () => {
    navigate("/sellingFish");
  };
  const koiCompatible = () => {
    navigate("/KoiCompatible");
  };
  const blogClick = () => {
    navigate("/blog");
  };
  const faqClick = () => {
    navigate("/faq");
  };

  return (
    <AppBar sx={{ backgroundColor: "#231815" }}>
      <Toolbar>
        <Box
          component="img"
          src={Logo}
          alt="KoiFengShui"
          sx={{
            height: "64px",
            mr: 4,
            filter: "brightness(1.1) contrast(1.1)",
            mixBlendMode: "screen",
            backgroundColor: "transparent",
            "&:hover": {
              cursor: "pointer",
              opacity: 0.8,
            },
          }}
          onClick={handleLogoClick}
        />

        <Box sx={{ flexGrow: 1 }} />
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            mr: 7,
            "&:hover": {
              cursor: "pointer",
              opacity: 0.8,
            },
          }}
          onClick={sellingFishClick}
        >
          Mua bán cá Koi
        </Typography>
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            mr: 7,
            "&:hover": {
              cursor: "pointer",
              opacity: 0.8,
            },
          }}
          onClick={koiCompatible}
        >
          Tư vấn bản mệnh
        </Typography>
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            mr: 7,
            "&:hover": {
              cursor: "pointer",
              opacity: 0.8,
            },
          }}
          onClick={blogClick}
        >
          Kinh nghiệm hay
        </Typography>
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            mr: 7,
            "&:hover": {
              cursor: "pointer",
              opacity: 0.8,
            },
          }}
          onClick={faqClick}
        >
          FAQ
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {isLoggedIn ? (
          <>
            <Box display="flex" alignItems="center">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar src={avatarUrl} alt={fullName} />
              </IconButton>
              <Box ml={1}>
                <Typography variant="subtitle1">{user.fullName}</Typography>
                <Typography variant="caption" color="inherit">
                  Mệnh: {elementName || "No Element"}
                </Typography>
              </Box>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {isLoggedIn && userRole === 1 && (
                <MenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/auth")}
          >
            Đăng nhập / Đăng kí
          </Button>
        )}

        {isLoggedIn && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{
              ml: 2,
              backgroundColor: "#ff4d4f",
              "&:hover": { backgroundColor: "#ff7875" },
            }}
            onClick={() => navigate("/upPost")}
          >
            Đăng tin
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
