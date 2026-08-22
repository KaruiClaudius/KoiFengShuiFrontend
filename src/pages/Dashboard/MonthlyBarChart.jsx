import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTrafficDistribution } from "../../api/dashboard";

function TrafficTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-gold/40 bg-surface px-3 py-2 shadow-plaque">
      <p className="font-display text-sm font-bold text-ink">{label}</p>
      <p className="text-sm text-ink-soft">
        {Number(payload[0].value).toLocaleString("vi-VN")} lượt
      </p>
    </div>
  );
}

TrafficTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default function MonthlyBarChart() {
  const [data, setData] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchTrafficData = async () => {
      try {
        const response = await getTrafficDistribution();
        const { registeredUsers, uniqueGuests, totalVisitors: visitors } =
          response.data;
        if (cancelled) return;
        setData([
          { name: "Người dùng đăng ký", count: registeredUsers },
          { name: "Khách truy cập", count: uniqueGuests },
        ]);
        setTotalVisitors(visitors);
      } catch (error) {
        console.error("Error fetching traffic distribution:", error);
      }
    };

    fetchTrafficData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
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
          <Tooltip
            content={<TrafficTooltip />}
            cursor={{ fill: "rgba(201, 162, 39, 0.08)" }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-crimson)"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-center text-sm text-muted">
        Tổng lượt truy cập: {totalVisitors.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
