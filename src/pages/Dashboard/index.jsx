import React, { useState, useEffect } from "react";
// material-ui
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Pagination } from "@mui/material";

// project import
import MainCard from "../../components/MainCard";
import AnalyticEcommerce from "../../components/cards/statistics/AnalyticEcommerce";
import MonthlyBarChart from "./MonthlyBarChart";
import UniqueVisitorCard from "./UniqueVisitorCard";
// import SaleReportCard from "./SaleReportCard";
import OrdersTable from "./OrdersTable";
import DashboardSidebar from "../../components/Sidebar/Sidebar";
import {
  getNewUsersCount,
  getNewUsersList,
  getNewMarketListingsCount,
  getTotalTransaction,
  getTotalTransactionCount,
} from "../../config/axios"; // Update the import path as needed
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";

// assets

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: "1rem",
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: "auto",
  right: "auto",
  alignSelf: "flex-start",
  transform: "none",
};

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newUsersList, setNewUsersList] = useState([]);
  const [newTotalTransaction, setNewTotalTransaction] = useState([]);
  const [newMarketListingsCount, setNewMarketListingsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);

  const itemsPerPage = 3;

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const countResponse = await getNewUsersCount();
        setNewUsersCount(countResponse.data.count);

        const usersResponse = await getNewUsersList();
        setNewUsersList(usersResponse.data);

        const marketListingsCountResponse = await getNewMarketListingsCount();
        setNewMarketListingsCount(marketListingsCountResponse.data.count);

        const totalTransaction = await getTotalTransaction();
        setNewTotalTransaction(totalTransaction.data);

        const transactionCountResponse = await getTotalTransactionCount();
        setTotalTransactionCount(transactionCountResponse.data.totalCount);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Handle error (e.g., show an error message to the user)
      }
    };
    setTotalPages(Math.ceil(newUsersList.length / itemsPerPage));
    fetchDashboardData();
  }, [newUsersList]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#14335c",
      }}
    >
      <AppHeader />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <DashboardSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            {/* row 1 */}

            <Grid item xs={12} sx={{ mb: -2.25 }}>
              <Typography variant="h5" color="white">
                Dashboard
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Tiền nạp ví"
                count={formatVND(newTotalTransaction.totalAmount || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Tổng giao dịch thành công"
                count={totalTransactionCount.toLocaleString()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Người dùng mới"
                count={newUsersCount.toString()}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Bài đăng mới"
                count={newMarketListingsCount.toString()}
                color="warning"
              />
            </Grid>

            <Grid
              item
              md={8}
              sx={{ display: { sm: "none", md: "block", lg: "none" } }}
            />

            {/* row 2 */}
            {/* Total posts */}
            <Grid item xs={12} md={7} lg={8}>
              <UniqueVisitorCard />
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h5" color="white">
                    Lượng truy cập
                  </Typography>
                </Grid>
                <Grid item />
              </Grid>
              <MainCard sx={{ mt: 2 }} content={false}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" color="text.secondary">
                      Thống kê tuần này
                    </Typography>
                  </Stack>
                </Box>
                <MonthlyBarChart />
              </MainCard>
            </Grid>

            {/* row 3 */}
            {/* Recent post */}
            <Grid item xs={12} md={7} lg={8}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h5" color="white">
                    Giao dịch gần đây
                  </Typography>
                </Grid>
                <Grid item />
              </Grid>
              <MainCard sx={{ mt: 2 }} content={false}>
                <OrdersTable />
              </MainCard>
            </Grid>

            {/* List new user */}
            <Grid item xs={12} md={5} lg={4}>
              <Grid item>
                <Typography variant="h5" color="white">
                  Người đăng kí mới
                </Typography>
              </Grid>
              <Grid item />
              <MainCard sx={{ mt: 2 }} content={false}>
                <List
                  component="nav"
                  sx={{
                    px: 0,
                    py: 0,
                    "& .MuiListItemButton-root": {
                      py: 1.5,
                      "& .MuiAvatar-root": avatarSX,
                      "& .MuiListItemSecondaryAction-root": {
                        ...actionSX,
                        position: "relative",
                      },
                    },
                  }}
                >
                  {newUsersList
                    .slice(startIndex, endIndex)
                    .map((user, index) => (
                      <ListItemButton
                        key={user.accountId}
                        divider={index < itemsPerPage - 1}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                              user.fullName
                            )}`}
                            alt={user.fullName}
                            sx={avatarSX}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {user.fullName}
                            </Typography>
                          }
                          secondary={new Date(user.createAt).toLocaleString()}
                        />
                      </ListItemButton>
                    ))}
                </List>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </MainCard>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <FooterComponent />
    </Box>
  );
}
