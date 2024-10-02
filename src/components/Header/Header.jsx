import React, { useEffect, useState } from "react";
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
import Logo from "../../assets/Logo_SWP.svg";

const AppHeader = () => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!token);

    if (token && user) {
      setFullName(user.fullName);
      setUserRole(user.roleId);
      setAvatarUrl(
        `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
          user.fullName
        )}`
      );
    }
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
          alt="UNINEST"
          sx={{
            height: "64px",
            mr: 4,
            filter: "brightness(1.1) contrast(1.1)",
            mixBlendMode: "screen",
            backgroundColor: "#231815",
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
              {userRole === 1 && (
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
