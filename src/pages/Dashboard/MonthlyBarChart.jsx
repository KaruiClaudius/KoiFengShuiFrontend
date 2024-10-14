import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ReactApexChart from "react-apexcharts";
import { getTrafficDistribution } from "../../config/axios";

const pieChartOptions = {
  chart: {
    type: "donut",
    height: 365,
  },
  labels: ["Registered Users", "Unique Guests"],
  legend: {
    show: true,
    position: "bottom",
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(1) + "%";
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total Visitors",
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
            },
          },
        },
      },
    },
  },
};

export default function TrafficDistributionChart() {
  const theme = useTheme();

  const { secondary } = theme.palette.text;
  const info = theme.palette.info.light;
  const warning = theme.palette.warning.light;
  const error = theme.palette.error.light;

  const [series, setSeries] = useState([0, 0, 0]);
  const [options, setOptions] = useState(pieChartOptions);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await getTrafficDistribution();
        const { registeredUsers, uniqueGuests, totalVisitors } = response.data;
        setSeries([registeredUsers, uniqueGuests]);
        setTotalVisitors(totalVisitors);
      } catch (error) {
        console.error("Error fetching traffic distribution:", error);
      }
    };

    fetchTrafficData();
  }, []);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [info, warning, error],
      theme: {
        mode: theme.palette.mode,
      },
      legend: {
        labels: {
          colors: secondary,
        },
      },
      plotOptions: {
        ...prevState.plotOptions,
        pie: {
          ...prevState.plotOptions.pie,
          donut: {
            ...prevState.plotOptions.pie.donut,
            labels: {
              ...prevState.plotOptions.pie.donut.labels,
              total: {
                ...prevState.plotOptions.pie.donut.labels.total,
                color: secondary,
                formatter: function () {
                  return totalVisitors;
                },
              },
            },
          },
        },
      },
    }));
  }, [theme, info, warning, error, secondary, totalVisitors]);

  return (
    <Box id="chart" sx={{ bgcolor: "transparent" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={365}
      />
    </Box>
  );
}
