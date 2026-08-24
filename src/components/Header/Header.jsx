import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "../../ui";
import { SealStamp } from "../../assets/motifs/Motifs.jsx";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { PATHS } from "../../routes/paths";
import Logo from "../../assets/Logo.png";

const NAV_LINKS = [
  { label: "Cộng đồng", to: PATHS.community },
  { label: "Đối tác", to: PATHS.partners },
  { label: "Tư vấn bản mệnh", to: PATHS.koiCompatible },
  { label: "Kinh nghiệm hay", to: PATHS.blog },
];

const ELEMENT_LABELS = {
  1: "Mộc",
  2: "Hoả",
  3: "Thổ",
  4: "Kim",
  5: "Thuỷ",
};

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Chuyển sáng/tối"
      aria-pressed={isDark}
      onClick={toggle}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-[#FDF6EC] transition-colors duration-fast hover:text-gold-soft focus-visible:shadow-gold"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4.25" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M4.93 19.07l1.41-1.41" />
            <path d="M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        )}
      </svg>
    </button>
  );
};

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const elementLabel = ELEMENT_LABELS[user?.elementId] ?? "Chưa xác định";
  const avatarUrl = user?.fullName
    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
        user.fullName
      )}`
    : "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-[#FDF6EC] shadow-plaque">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Koi FengShui — Về trang chủ"
          className="flex shrink-0 items-center gap-2.5"
        >
          <img src={Logo} alt="" className="h-10 w-auto" />
          <SealStamp char="鯉" size={34} rotate={-6} aria-hidden="true" />
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium transition-colors duration-fast hover:text-gold-soft"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Menu>
                <MenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Tài khoản"
                    className="rounded-full outline-none focus-visible:shadow-gold"
                  >
                    <img
                      src={avatarUrl}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 rounded-full border border-gold/50"
                    />
                  </button>
                </MenuTrigger>
                <MenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="font-display text-sm font-semibold text-ink">
                      {user?.fullName ?? ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Mệnh: {elementLabel}
                    </p>
                  </div>
                  <MenuSeparator />
                  {isAdmin && (
                    <MenuItem onSelect={() => navigate(PATHS.dashboard)}>
                      Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onSelect={() => navigate(PATHS.profile)}>
                    Hồ sơ
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem onSelect={handleLogout}>Đăng xuất</MenuItem>
                </MenuContent>
              </Menu>
            </>
          ) : (
            <Button variant="gold" size="sm" as={Link} to={PATHS.auth}>
              Đăng nhập
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-label="Mở menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[#FDF6EC] transition-colors duration-fast hover:bg-white/10 focus-visible:shadow-gold md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gold/20 bg-ink px-4 pb-5 pt-2 sm:px-6 md:hidden">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <nav aria-label="Điều hướng di động" className="flex flex-col">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={closeMobileMenu}
                className="py-2.5 text-[15px] font-medium transition-colors duration-fast hover:text-gold-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-gold/20 pt-4">
            {isLoggedIn ? (
              <>
                <Link
                  to={PATHS.profile}
                  onClick={closeMobileMenu}
                  className="py-2.5 text-[15px] font-medium transition-colors duration-fast hover:text-gold-soft"
                >
                  Hồ sơ
                </Link>
                {isAdmin && (
                  <Link
                    to={PATHS.dashboard}
                    onClick={closeMobileMenu}
                    className="py-2.5 text-[15px] font-medium transition-colors duration-fast hover:text-gold-soft"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full rounded-md border border-gold/50 px-5 py-2.5 text-[15px] font-semibold text-[#FDF6EC] transition-colors duration-fast hover:bg-white/10 focus-visible:shadow-gold"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Button
                variant="gold"
                size="md"
                as={Link}
                to={PATHS.auth}
                onClick={closeMobileMenu}
                className="w-full"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
