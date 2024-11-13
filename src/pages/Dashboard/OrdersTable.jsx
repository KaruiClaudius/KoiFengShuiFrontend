import PropTypes from "prop-types";
import { useState, useEffect } from "react";
// material-ui
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import dayjs from "dayjs";
import DateRangePicker from "../../components/DateRangePicker";
// project import
import Dot from "../../components/@extended/Dot";

// Import the API function
import { getTransactionListing } from "../../config/axios";

const headCells = [
  {
    id: "transactionId",
    align: "left",
    disablePadding: false,
    label: "Transaction ID",
  },
  {
    id: "transactionDate",
    align: "left",
    disablePadding: true,
    label: "Thời gian giao dịch",
  },
  {
    id: "accountFullName",
    align: "left",
    disablePadding: true,
    label: "Tên",
  },
  {
    id: "status",
    align: "left",
    disablePadding: false,
    label: "Trạng thái",
  },
  {
    id: "amount",
    align: "left",
    disablePadding: false,
    label: "Giá",
  },
];

// Add this date formatting function
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Format: DD/MM/YYYY HH:mm
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    case "cancel":
      return "error";
    default:
      return "default";
  }
};

function OrderStatus({ status }) {
  const color = getStatusColor(status);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Dot color={color} />
      <Typography>{status}</Typography>
    </Stack>
  );
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function OrderTable() {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("listingId");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(100);
  // Add state for date range
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const fetchListings = async (currentPage, startDate, endDate) => {
    try {
      setLoading(true);
      const response = await getTransactionListing({
        page: currentPage,
        pageSize,
        startDate,
        endDate,
      });
      setListings(response.data.transactions);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate }); // Store the selected dates
    setPage(1); // Reset to first page when date range changes
    fetchListings(1, startDate, endDate);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchListings(newPage, dateRange.startDate, dateRange.endDate); // Use stored date range
  };

  useEffect(() => {
    fetchListings(page, dateRange.startDate, dateRange.endDate);
  }, []); // Only run on mount

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {" "}
      {/* Add padding around the entire container */}
      {/* Date Range Picker Section */}
      <Box sx={{ mb: 4 }}>
        {" "}
        {/* Add margin bottom to separate from table */}
        <DateRangePicker
          onDateRangeChange={handleDateRangeChange}
          initialStartDate={dateRange.startDate}
          initialEndDate={dateRange.endDate}
        />
      </Box>
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          position: "relative",
          display: "block",
          maxWidth: "100%",
          "& td, & th": { whiteSpace: "nowrap" },
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {listings.map((row) => (
              <TableRow
                hover
                role="checkbox"
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                tabIndex={-1}
                key={row.transactionId}
              >
                <TableCell component="th" scope="row">
                  {row.transactionId}
                </TableCell>
                <TableCell>{formatDate(row.transactionDate)}</TableCell>
                <TableCell>{row.accountFullName}</TableCell>
                <TableCell>
                  <OrderStatus status={row.status} />
                </TableCell>
                <TableCell>{formatCurrency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(totalCount / pageSize)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}

OrderTableHead.propTypes = {
  order: PropTypes.string,
  orderBy: PropTypes.string,
};

OrderStatus.propTypes = {
  status: PropTypes.string.isRequired,
};
