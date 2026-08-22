import { useState } from "react";
import { Button, Card } from "../../ui";
import IncomeAreaChart from "./IncomeAreaChart";

const slots = [
  { key: "week", label: "Tuần", caption: "7 ngày qua" },
  { key: "month", label: "Tháng", caption: "30 ngày qua" },
];

export default function UniqueVisitorCard() {
  const [slot, setSlot] = useState("week");
  const active = slots.find((item) => item.key === slot);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Số bài đăng
          </h2>
          <p className="text-sm text-muted">Bài đăng mới theo danh mục</p>
        </div>
        <div className="flex items-center gap-2">
          {slots.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={slot === item.key ? "primary" : "ghost"}
              aria-pressed={slot === item.key}
              onClick={() => setSlot(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-jade" aria-hidden="true">
          ▲
        </span>
        <span className="text-sm font-semibold text-jade">{active.caption}</span>
      </div>
      <div className="mt-3">
        <IncomeAreaChart slot={slot} />
      </div>
    </Card>
  );
}
