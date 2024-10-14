import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ApprovalIcon from "@mui/icons-material/Approval";
import AppHeader from "../Header/Header";

const drawerWidth = 240;

const DashboardSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Approve Posts",
      icon: <ApprovalIcon />,
      path: "/dashboard/approve-posts",
    },
  ];

  return (
    <Box sx={{ display: "sticky", flexGrow: 1, paddingBottom: 50 }}>
      <AppHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      ></Box>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "64px",
            bottom: "60px", // Adjust this value based on your AppHeader height
            height: "calc(100% - 64px - 64px)", // Adjust this value based on your AppHeader height
          },
        }}
      >
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardSidebar;
