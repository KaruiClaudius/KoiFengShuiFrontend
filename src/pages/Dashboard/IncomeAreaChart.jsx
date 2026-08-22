import PropTypes from "prop-types";
import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "../../ui";
import { getNewMarketListingsByCategory } from "../../api/dashboard";

function CategoryTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-gold/40 bg-surface px-3 py-2 shadow-plaque">
      <p className="font-display text-sm font-bold text-ink">{label}</p>
      <p className="text-sm text-ink-soft">
        {Number(payload[0].value).toLocaleString("vi-VN")} bài đăng
      </p>
    </div>
  );
}

CategoryTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default function IncomeAreaChart({ slot }) {
  const gradientId = `area-gradient-${useId().replace(/:/g, "")}`;
  const days = slot === "month" ? 30 : 7;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const response = await getNewMarketListingsByCategory(days);
        const categoryData = response.data;
        if (cancelled) return;
        setData(
          categoryData.map((item) => ({
            name: item.categoryName,
            count: item.count,
          }))
        );
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCategoryData();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading) {
    return <Skeleton className="h-[320px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--element-thuy)"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="var(--element-thuy)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e7dcc3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          axisLine={{ stroke: "#e7dcc3" }}
          tickLine={false}
          interval={0}
          tickMargin={8}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CategoryTooltip />} cursor={{ stroke: "#e7dcc3" }} />
        <Area
          type="monotone"
          dataKey="count"
          name="Số bài đăng"
          stroke="var(--element-thuy)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

IncomeAreaChart.propTypes = {
  slot: PropTypes.string,
};
