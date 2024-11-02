// components/DateRangePicker.jsx
import { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Stack, Button } from "@mui/material";
import dayjs from "dayjs";
import PropTypes from "prop-types";

export default function DateRangePicker({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}) {
  const [startDate, setStartDate] = useState(
    initialStartDate ? dayjs(initialStartDate) : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? dayjs(initialEndDate) : null
  );

  useEffect(() => {
    setStartDate(initialStartDate ? dayjs(initialStartDate) : null);
    setEndDate(initialEndDate ? dayjs(initialEndDate) : null);
  }, [initialStartDate, initialEndDate]);

  const handleApply = () => {
    const formattedStartDate = startDate
      ? startDate.format("YYYY-MM-DD")
      : null;
    const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : null;
    onDateRangeChange(formattedStartDate, formattedEndDate);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange(null, null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" spacing={2} alignItems="center">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={!startDate && !endDate}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={!startDate && !endDate}
        >
          Clear
        </Button>
      </Stack>
    </LocalizationProvider>
  );
}

DateRangePicker.propTypes = {
  onDateRangeChange: PropTypes.func.isRequired,
  initialStartDate: PropTypes.string,
  initialEndDate: PropTypes.string,
};

DateRangePicker.defaultProps = {
  initialStartDate: null,
  initialEndDate: null,
};
