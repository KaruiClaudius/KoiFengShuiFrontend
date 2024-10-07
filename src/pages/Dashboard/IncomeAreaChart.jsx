import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { getNewMarketListingsByCategory } from "../../config/axios";

const areaChartOptions = {
  chart: {
    height: 450,
    type: "area",
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  grid: {
    strokeDashArray: 0,
  },
};

export default function IncomeAreaChart({ slot }) {
  const theme = useTheme();
  const { secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState(areaChartOptions);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const days = slot === "month" ? 30 : 7;
        const response = await getNewMarketListingsByCategory(days);
        const categoryData = response.data;

        // Process data for chart
        const categories = categoryData.map((item) => item.categoryName);
        const seriesData = [
          {
            name: "Số lượng bài đăng",
            data: categoryData.map((item) => item.count),
          },
        ];

        setOptions((prevState) => ({
          ...prevState,
          colors: [theme.palette.primary.main],
          xaxis: {
            categories: categories,
            labels: {
              style: {
                colors: Array(categories.length).fill(secondary),
              },
            },
            axisBorder: {
              show: true,
              color: line,
            },
            tickAmount: categories.length,
          },
          yaxis: {
            labels: {
              style: {
                colors: [secondary],
              },
            },
          },
          grid: {
            borderColor: line,
          },
        }));

        setSeries(seriesData);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slot, theme, secondary, line]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={450}
    />
  );
}

IncomeAreaChart.propTypes = { slot: PropTypes.string };
