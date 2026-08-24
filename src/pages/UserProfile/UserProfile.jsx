import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Skeleton,
  notify,
} from "../../ui";
import { useAuth } from "../../context/AuthContext";
import { getAccountById, updateAccount, changePassword } from "../../api/auth";
import { extractApiError } from "../../api/core";
import { PATHS } from "../../routes/paths";

const ELEMENT_NAMES = { 1: "Mộc", 2: "Hoả", 3: "Thổ", 4: "Kim", 5: "Thuỷ" };
const ELEMENT_IDS_BY_NAME = Object.fromEntries(
  Object.entries(ELEMENT_NAMES).map(([id, name]) => [name, Number(id)])
);
const ELEMENT_BADGES = { 1: "moc", 2: "hoa", 3: "tho", 4: "kim", 5: "thuy" };
const UNKNOWN_ELEMENT = "Không xác định";

const NAV_ITEMS = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "security", label: "Cài đặt tài khoản" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const EMPTY_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const avatarUrl = (name) =>
  `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
    name || "Koi"
  )}`;

const toFormState = (data) => {
  const elementId = data?.elementId ?? ELEMENT_IDS_BY_NAME[data?.elementName] ?? null;
  return {
    fullName: data?.fullName ?? "",
    phone: data?.phone ?? "",
    email: data?.email ?? "",
    gender: data?.gender ?? "",
    dob: data?.dob ? String(data.dob).slice(0, 10) : "",
    elementName:
      (elementId && ELEMENT_NAMES[elementId]) || data?.elementName || UNKNOWN_ELEMENT,
    elementId,
  };
};

function NavRail({ activeTab, onSelect }) {
  return (
    <nav
      aria-label="Mục tài khoản"
      className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.id === activeTab;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active ? "true" : undefined}
            className={`shrink-0 rounded-md border-l-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-fast ease-water outline-none focus-visible:shadow-gold ${
              active
                ? "border-gold bg-paper-2/60 text-crimson"
                : "border-transparent text-muted hover:bg-paper-2/40 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

NavRail.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function GenderSelect({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="gender" className="text-sm font-semibold text-ink">
        Giới tính
      </label>
      <select
        id="gender"
        name="gender"
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        className={`rounded-md border bg-surface px-3.5 py-2.5 outline-none transition-shadow duration-fast focus:shadow-gold ${
          error ? "border-crimson" : "border-gold/40 focus:border-gold"
        }`}
      >
        <option value="">Chọn giới tính</option>
        {GENDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-crimson">{error}</p>}
    </div>
  );
}

GenderSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr] md:gap-10"
    >
      <Skeleton className="h-24 md:h-28" />
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} className="h-[70px]" />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Skeleton className="h-11 w-36" />
        </div>
      </Card>
    </div>
  );
}

const UserProfile = () => {
  const { updateUser, user: authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "1";
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [form, setForm] = useState(toFormState(null));
  const [profileErrors, setProfileErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      if (!authUser?.accountId) {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getAccountById(authUser.accountId);
        if (!cancelled) {
          setUser(response.data);
          setForm(toFormState(response.data));
        }
      } catch (error) {
        const apiError = extractApiError(error);
        console.error("Error fetching user data:", apiError.code, apiError.status);
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [retryToken, authUser?.accountId]);

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updatePasswordField = (field) => (event) => {
    const { value } = event.target;
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    }
    if (!form.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    }
    if (!form.gender) {
      errors.gender = "Vui lòng chọn giới tính";
    }
    if (!form.dob) {
      errors.dob = "Vui lòng chọn ngày sinh";
    }
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setSaving(true);
    try {
      await updateAccount(user.accountId, {
        email: form.email,
        fullName: form.fullName,
        dob: form.dob,
        gender: form.gender,
        phone: form.phone,
      });
      const response = await getAccountById(user.accountId);
      setUser(response.data);
      setForm(toFormState(response.data));
      updateUser(response.data);
      notify.success("Thông tin cá nhân đã được cập nhật thành công");
    } catch (error) {
      const apiError = extractApiError(error);
      console.error("Error updating profile:", apiError.code, apiError.status);
      notify.error(
        `Lỗi cập nhật thông tin: ${apiError.message || "Vui lòng thử lại."}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!passwords.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!passwords.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwords.newPassword.length < 8) {
      errors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwords.confirmPassword !== passwords.newPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(user.accountId, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      notify.success("Đổi mật khẩu thành công");
      setPasswords(EMPTY_PASSWORDS);
    } catch (error) {
      const apiError = extractApiError(error);
      console.error("Error changing password:", apiError.code, apiError.status);
      notify.error(
        `Lỗi đổi mật khẩu: ${apiError.message || "Vui lòng thử lại."}`
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const elementBadge = form.elementId ? ELEMENT_BADGES[form.elementId] : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              to={PATHS.home}
              className="transition-colors duration-fast hover:text-crimson"
            >
              Trang chủ
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="font-medium text-ink-soft">
            Tài khoản
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 animate-fade-rise font-display text-3xl text-ink md:text-4xl lg:text-5xl">
        Thông tin cá nhân
      </h1>

      {isOnboarding && (
        <div
          role="status"
          className="mt-4 rounded-md border-gold/50 bg-gold/10 p-4 text-sm text-ink-soft"
        >
          Chào mừng bạn! Vui lòng hoàn thiện ngày sinh và giới tính để chúng tôi
          tư vấn bản mệnh chính xác nhất.
        </div>
      )}

      {loading ? (
        <ProfileSkeleton />
      ) : loadError ? (
        <EmptyState
          title="Không thể tải thông tin"
          description="Đã có lỗi xảy ra khi tải thông tin tài khoản. Vui lòng thử lại."
          action={
            <Button onClick={() => setRetryToken((token) => token + 1)}>
              Thử lại
            </Button>
          }
          className="mt-8"
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr] md:gap-10">
          <NavRail activeTab={activeTab} onSelect={setActiveTab} />

          {activeTab === "profile" ? (
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl(form.fullName)}
                  alt={`Ảnh đại diện của ${form.fullName}`}
                  loading="lazy"
                  className="h-16 w-16 rounded-full border border-gold/50 bg-paper-2"
                />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl text-ink">
                    {form.fullName || "Người dùng"}
                  </h3>
                  {elementBadge && (
                    <Badge element={elementBadge} className="mt-1.5">
                      Bản mệnh: {form.elementName}
                    </Badge>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                noValidate
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <Input
                  label="Họ và tên"
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField("fullName")}
                  error={profileErrors.fullName}
                />
                <Input
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField("phone")}
                  error={profileErrors.phone}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    disabled
                    className="cursor-not-allowed !bg-paper-2 text-muted"
                  />
                </div>
                <GenderSelect
                  value={form.gender}
                  onChange={updateField("gender")}
                  error={profileErrors.gender}
                />
                <Input
                  label="Ngày sinh"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={updateField("dob")}
                  error={profileErrors.dob}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Mệnh"
                    name="elementName"
                    value={form.elementName}
                    disabled
                    className="cursor-not-allowed !bg-paper-2 text-muted"
                  />
                </div>
                <div className="flex justify-end pt-2 sm:col-span-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Đang lưu…" : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-6 md:p-8">
              <h3 className="font-display text-xl text-ink">Đổi mật khẩu</h3>
              <p className="mt-1 text-sm text-muted">
                Duy trì mật khẩu mạnh để bảo vệ tài khoản của bạn.
              </p>
              <form
                onSubmit={handlePasswordSubmit}
                noValidate
                className="mt-6 flex max-w-md flex-col gap-4"
              >
                <Input
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={updatePasswordField("currentPassword")}
                  error={passwordErrors.currentPassword}
                />
                <Input
                  label="Mật khẩu mới"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  hint="Ít nhất 6 ký tự"
                  value={passwords.newPassword}
                  onChange={updatePasswordField("newPassword")}
                  error={passwordErrors.newPassword}
                />
                <Input
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={updatePasswordField("confirmPassword")}
                  error={passwordErrors.confirmPassword}
                />
                <div className="pt-2">
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? "Đang cập nhật…" : "Đổi mật khẩu"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </main>
  );
};

export default UserProfile;
