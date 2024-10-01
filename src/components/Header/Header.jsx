import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo_SWP.svg";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "60ch",
    },
  },
}));

const categories = [
  {
    label: "Category",
    key: "SubMenu",
    icon: <MenuIcon />,
    children: [
      {
        label: "Thuê nhà",
        key: "setting:1",
        navigate: "/renting",
      },
      {
        label: "Dịch vụ bên thứ ba",
        key: "setting:2",
        navigate: "/services",
      },
    ],
  },
];

const AppHeader = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);

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

  const handleCategoryMenu = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#F9A825" }}>
      <Toolbar>
        <Box
          component="img"
          src={Logo}
          alt="UNINEST"
          sx={{
            height: "64px",
            mixBlendMode: "multiply", // This can help with white backgrounds
            backgroundColor: "transparent",
          }}
          onClick={handleLogoClick}
        />

        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleCategoryMenu}
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Categories
        </Typography>
        <Menu
          anchorEl={categoryAnchorEl}
          open={Boolean(categoryAnchorEl)}
          onClose={handleCategoryClose}
        >
          {categories[0].children.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                handleCategoryClose();
                navigate(item.navigate);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit">
          <MessageIcon />
        </IconButton>
        <IconButton color="inherit">
          <DescriptionIcon />
        </IconButton>

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
          >
            Đăng tin
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
