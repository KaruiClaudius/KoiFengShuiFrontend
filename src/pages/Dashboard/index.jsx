import { useEffect, useState } from "react";
import { Button, Card, EmptyState } from "../../ui";
import { LotusMark } from "../../assets/motifs/Motifs";
import { getNewUsersCount, getNewUsersList } from "../../api/dashboard";
import MonthlyBarChart from "./MonthlyBarChart";

const ITEMS_PER_PAGE = 3;

const formatDate = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function DashboardDefault() {
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newUsersList, setNewUsersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(newUsersList.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    let cancelled = false;
    const fetchDashboardData = async () => {
      try {
        const countResponse = await getNewUsersCount();
        if (cancelled) return;
        setNewUsersCount(countResponse.data.count);

        const usersResponse = await getNewUsersList();
        if (cancelled) return;
        setNewUsersList(usersResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleUsers = newUsersList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted">Tổng quan hoạt động của hệ thống</p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Người dùng mới
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-ink">
            {newUsersCount.toLocaleString("vi-VN")}
          </p>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <LotusMark size={36} className="shrink-0 text-jade" />
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              Sức khỏe hệ thống
              <span
                className="inline-block h-2 w-2 rounded-full bg-jade"
                aria-hidden="true"
              />
            </p>
            <p className="mt-1 font-display text-lg font-bold text-jade">
              Hoạt động bình thường
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Lượng truy cập
          </h2>
          <p className="text-sm text-muted">Thống kê tuần này</p>
          <div className="mt-4">
            <MonthlyBarChart />
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-5">
        <h2 className="font-display text-xl font-bold text-ink">
          Người đăng kí mới
        </h2>
        {visibleUsers.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="Chưa có người dùng mới"
            description="Danh sách sẽ được cập nhật khi có người đăng ký."
          />
        ) : (
          <ul className="mt-2 divide-y divide-gold/20">
            {visibleUsers.map((user) => (
              <li key={user.accountId} className="flex items-center gap-3 py-3">
                <img
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                    user.fullName
                  )}`}
                  alt={user.fullName}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full border border-gold/40 bg-paper-2 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(user.createAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-gold/20 pt-4">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Trang trước"
            disabled={currentPage <= 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Trang sau
          </Button>
        </div>
      </Card>
    </section>
  );
}
