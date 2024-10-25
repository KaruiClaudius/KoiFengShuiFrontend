import PropTypes from "prop-types";
import { useState, useEffect } from "react";
// material-ui
import Link from "@mui/material/Link";
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
    id: "tierName",
    align: "left",
    disablePadding: true,
    label: "Loại",
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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await getTransactionListing();
        setListings(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch market listings");
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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
    <Box>
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
                <TableCell>{row.tierName}</TableCell>
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
