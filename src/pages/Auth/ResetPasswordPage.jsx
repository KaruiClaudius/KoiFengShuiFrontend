import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { extractApiError } from "../../api/core";
import { PATHS } from "../../routes/paths";
import { Button, Card, Input } from "../../ui";
import { SealStamp } from "../../assets/motifs/Motifs";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (!newPassword || newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(
        apiError.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={() => navigate(PATHS.home)}
          className="inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:shadow-gold"
          aria-label="Về trang chủ Koi Feng Shui"
        >
          <SealStamp char="鯉" size={40} />
          <span className="font-display text-base font-semibold text-ink">
            Koi Feng Shui
          </span>
        </button>

        <Card className="animate-fade-rise p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-sm text-muted">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {done ? (
            <div className="mt-6 space-y-4">
              <div
                role="status"
                className="rounded-md border-jade bg-jade/10 p-3 text-sm text-jade"
              >
                Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu
                mới.
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(PATHS.auth)}
              >
                Đến trang đăng nhập
              </Button>
            </div>
          ) : !token ? (
            <div className="mt-6 space-y-4">
              <div
                role="alert"
                className="rounded-md border-crimson bg-crimson/10 p-3 text-sm text-crimson"
              >
                Liên kết không hợp lệ hoặc thiếu mã đặt lại mật khẩu.
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(PATHS.auth)}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Input
                label="Mật khẩu mới"
                type="password"
                name="newPassword"
                autoComplete="new-password"
                required
              />
              <Input
                label="Nhập lại mật khẩu mới"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
              />
              {error && (
                <div
                  role="alert"
                  className="rounded-md border-crimson bg-crimson/10 p-3 text-sm text-crimson"
                >
                  {error}
                </div>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Đang xử lý…" : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
