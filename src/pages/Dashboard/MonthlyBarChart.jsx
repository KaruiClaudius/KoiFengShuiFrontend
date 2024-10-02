import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ReactApexChart from "react-apexcharts";

const pieChartOptions = {
  chart: {
    type: "donut",
    height: 365,
  },
  labels: ["Registered Users", "Guests"],
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
            label: "Total Traffic",
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

  const { primary, secondary } = theme.palette.text;
  const info = theme.palette.info.light;
  const warning = theme.palette.warning.light;

  const [series, setSeries] = useState([60, 40]); // Example data: 60% registered, 40% guests
  const [options, setOptions] = useState(pieChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [info, warning],
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
              },
            },
          },
        },
      },
    }));
  }, [theme, info, warning, secondary]);

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
