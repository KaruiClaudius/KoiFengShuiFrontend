// material-ui
import Avatar from "@mui/material/Avatar";
// import AvatarGroup from "@mui/material/AvatarGroup";
// import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project import
import MainCard from "../../components/MainCard";
import AnalyticEcommerce from "../../components/cards/statistics/AnalyticEcommerce";
import MonthlyBarChart from "./MonthlyBarChart";
import UniqueVisitorCard from "./UniqueVisitorCard";
// import SaleReportCard from "./SaleReportCard";
import OrdersTable from "./OrdersTable";
import FooterComponent from "../../components/Footer/Footer";
import DashboardSidebar from "../../components/Sidebar/Sidebar";

// assets
import GiftOutlined from "@ant-design/icons/GiftOutlined";
import MessageOutlined from "@ant-design/icons/MessageOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";

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
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#14335c",
      }}
    >
      {/* <AppHeader /> */}
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
                title="Tiền dịch vụ"
                count="4,42,236"
                // percentage={59.3}
                // extra="35,000"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="AVG Revenue"
                count="78,250"
                // percentage={70.5}
                // extra="8,900"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Người dùng mới"
                count="18,800"
                // percentage={27.4}
                // isLoss
                color="warning"
                // extra="1,943"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AnalyticEcommerce
                title="Bài đăng mới"
                count="$35,078"
                // percentage={27.4}
                // isLoss
                color="warning"
                // extra="$20,395"
              />
            </Grid>

            <Grid
              item
              md={8}
              sx={{ display: { sm: "none", md: "block", lg: "none" } }}
            />

            {/* row 2 */}
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
                    {/* <Typography variant="h3">7,650 người</Typography> */}
                  </Stack>
                </Box>
                <MonthlyBarChart />
              </MainCard>
            </Grid>

            {/* row 3 */}
            <Grid item xs={12} md={7} lg={8}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h5" color="white">
                    Bài đăng gần đây
                  </Typography>
                </Grid>
                <Grid item />
              </Grid>
              <MainCard sx={{ mt: 2 }} content={false}>
                <OrdersTable />
              </MainCard>
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
              <Grid item>
                <Typography variant="h5" color="white">
                  Người dùng mới
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
                  <ListItemButton divider>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          color: "success.main",
                          bgcolor: "success.lighter",
                        }}
                      >
                        <GiftOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          Order #002434
                        </Typography>
                      }
                      secondary="Today, 2:00 AM"
                    />
                    <ListItemSecondaryAction>
                      <Stack alignItems="flex-end"></Stack>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                  <ListItemButton divider>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          color: "primary.main",
                          bgcolor: "primary.lighter",
                        }}
                      >
                        <MessageOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          Order #984947
                        </Typography>
                      }
                      secondary="5 August, 1:45 PM"
                    />
                    <ListItemSecondaryAction>
                      <Stack alignItems="flex-end"></Stack>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ color: "error.main", bgcolor: "error.lighter" }}
                      >
                        <SettingOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          Order #988784
                        </Typography>
                      }
                      secondary="7 hours ago"
                    />
                    <ListItemSecondaryAction>
                      <Stack alignItems="flex-end"></Stack>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </List>
              </MainCard>
            </Grid>

            {/* row 4 */}
            <Grid item xs={12} md={7} lg={8}>
              {/* <SaleReportCard /> */}
            </Grid>
            <Grid item xs={12} md={5} lg={4}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              ></Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <FooterComponent />
    </Box>
  );
}
