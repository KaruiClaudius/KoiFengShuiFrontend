import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../config/axios";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input, notify } from "../../ui";
import { LotusMark, SealStamp, WaveBand } from "../../assets/motifs/Motifs";
import GoogleLoginButton from "./GoogleLoginButton";

const MODE_TITLE = {
  signin: "Đăng nhập",
  signup: "Đăng ký",
  forgotpassword: "Quên mật khẩu",
};

const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12 C5 6.5 9 4.5 12 4.5 C15 4.5 19 6.5 22 12 C19 17.5 15 19.5 12 19.5 C9 19.5 5 17.5 2 12 Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4 L20 20" />
    <path d="M10.6 6 C11.05 5.68 11.52 5.42 12 5.42 M9 4.8 C6.3 6 3.7 8.4 2 12 C3.2 14.2 4.8 16 6.6 17.2 M11.5 18.55 C11.66 18.56 11.83 18.58 12 18.58 C15 18.58 19 16.6 22 12 C21.1 10.4 20 9.1 18.9 8.1" />
    <path d="M9.9 9.9 C9.03 10.77 8.5 12.06 8.8 13.2 C9.1 14.34 10.05 15.29 11.2 15.59 C12.35 15.89 13.63 15.36 14.5 14.49" />
  </svg>
);

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("signin");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
    setError("");
    setFormErrors({});
    setForgotSent("");
    setShowPassword(false);
  };

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.get("fullName").trim()) {
      errors.fullName = "Họ và tên không được để trống";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.get("fullName"))) {
      errors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }

    if (!formData.get("email").trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.get("email"))) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.get("password")) {
      errors.password = "Mật khẩu không được để trống";
    } else if (formData.get("password").length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    const dob = new Date(formData.get("doB"));
    if (!formData.get("doB")) {
      errors.doB = "Ngày sinh không được để trống";
    } else if (isNaN(dob.getTime())) {
      errors.doB = "Ngày sinh không hợp lệ";
    }

    if (!formData.get("phone").trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10}$/.test(formData.get("phone"))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.get("gender")) {
      errors.gender = "Vui lòng chọn giới tính";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setForgotSent("");
    const formData = new FormData(event.currentTarget);
    if (authMode === "signup") {
      const validationErrors = validateForm(formData);
      setFormErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setSubmitting(true);
    try {
      switch (authMode) {
        case "signin": {
          const response = await api.post("api/Auth/SignIn", {
            email: formData.get("email"),
            password: formData.get("password"),
          });
          const { token, email } = response.data;

          const userDetailsResponse = await api.get(`api/Account/email/${email}`);
          const userDetails = userDetailsResponse.data;

          login({ newToken: token, newUser: userDetails, email });
          navigate(PATHS.home);
          break;
        }
        case "signup": {
          try {
            await api.post("api/Auth/SignUp", {
              fullName: formData.get("fullName"),
              email: formData.get("email"),
              password: formData.get("password"),
              doB: formData.get("doB"),
              phone: formData.get("phone"),
              gender: formData.get("gender"),
            });
            notify.success("Đăng ký thành công. Vui lòng đăng nhập.");
            toggleAuthMode("signin");
          } catch (err) {
            console.error("Sign up failed:", err.response?.status || err.message);
            setError(
              typeof err.response?.data === "string" && err.response.data
                ? err.response.data
                : "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại."
            );
          }
          break;
        }
        case "forgotpassword": {
          try {
            await api.post("api/Auth/ForgotPassword", {
              email: formData.get("email"),
            });
            setForgotSent(
              "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mật khẩu mới cho bạn."
            );
          } catch (err) {
            console.error(
              "Forgot password failed:",
              err.response?.status || err.message
            );
            setError(
              typeof err.response?.data === "string" && err.response.data
                ? err.response.data
                : "Đã xảy ra lỗi trong quá trình khôi phục mật khẩu. Vui lòng thử lại."
            );
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        if (err.response.data.message === "Email not found.") {
          setError("Email không tồn tại.");
        } else if (err.response.data.message === "Incorrect password.") {
          setError("Mật khẩu không đúng.");
        } else {
          setError(
            err.response.data.message || "Đăng nhập thất bại. Vui lòng thử lại."
          );
        }
      } else {
        setError(
          "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="910517568057-gbk894g908blesmb6v6oa64ida68co4b.apps.googleusercontent.com">
      <div className="grid min-h-dvh bg-paper lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-pond p-10 text-[#FDF6EC] lg:flex lg:flex-col lg:justify-between xl:p-14">
          <WaveBand
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
            height={140}
            opacity={0.2}
          />
          <div className="flex items-center gap-3">
            <SealStamp char="鯉" size={56} />
            <span className="font-display text-lg font-semibold tracking-wide">
              Hóa Long 化龍
            </span>
          </div>
          <div className="relative z-10 max-w-md space-y-5">
            <LotusMark size={40} className="text-gold" />
            <h1 className="font-display text-4xl font-semibold leading-tight xl:text-5xl">
              Cá chép hoá rồng
            </h1>
            <p className="text-[15px] leading-relaxed text-[#FDF6EC]/80">
              Nơi chú cá chép vượt Võ Môn, mang tài lộc và bình an về tổ ấm của bạn.
            </p>
          </div>
          <p className="relative z-10 text-xs text-[#FDF6EC]/60">
            © Koi Feng Shui {new Date().getFullYear()}
          </p>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-6">
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
                {MODE_TITLE[authMode]}
              </h2>

              {authMode === "forgotpassword" ? (
                <p className="mt-2 text-sm text-muted">
                  Điền Email để chúng tôi gửi mật khẩu mới cho bạn
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  {authMode === "signin" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                  <button
                    type="button"
                    onClick={() =>
                      toggleAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                    className="rounded-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:outline-none focus-visible:shadow-gold"
                  >
                    {authMode === "signin" ? "Đăng ký ngay" : "Đăng nhập ngay"}
                  </button>
                </p>
              )}

              {authMode === "forgotpassword" && (
                <button
                  type="button"
                  onClick={() => toggleAuthMode("signin")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:outline-none focus-visible:shadow-gold"
                >
                  <span aria-hidden="true">←</span> Quay lại đăng nhập
                </button>
              )}

              {authMode === "signin" && (
                <>
                  <div className="mt-6">
                    <GoogleLoginButton />
                  </div>
                  <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
                    <span className="h-px flex-1 bg-gold/30" />
                    Hoặc đăng nhập bằng
                    <span className="h-px flex-1 bg-gold/30" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                {authMode === "signup" && (
                  <Input
                    label="Họ và tên"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    error={formErrors.fullName}
                    aria-invalid={!!formErrors.fullName}
                  />
                )}

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  error={formErrors.email}
                  aria-invalid={!!formErrors.email}
                />

                {authMode !== "forgotpassword" && (
                  <div className="relative">
                    <Input
                      label="Mật khẩu"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete={
                        authMode === "signup" ? "new-password" : "current-password"
                      }
                      error={formErrors.password}
                      aria-invalid={!!formErrors.password}
                      className="w-full pr-11"
                    />
                    <button
                      type="button"
                      onClick={handleTogglePassword}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3 top-[35px] rounded-sm text-muted transition-colors duration-fast hover:text-ink focus-visible:outline-none focus-visible:shadow-gold"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                )}

                {authMode === "signup" && (
                  <>
                    <Input
                      label="Ngày sinh"
                      type="date"
                      name="doB"
                      error={formErrors.doB}
                      aria-invalid={!!formErrors.doB}
                    />
                    <Input
                      label="Số điện thoại"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      error={formErrors.phone}
                      aria-invalid={!!formErrors.phone}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="gender" className="text-sm font-semibold text-ink">
                        Giới tính
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        defaultValue=""
                        aria-invalid={!!formErrors.gender}
                        className={`appearance-none rounded-md border bg-surface px-3.5 py-2.5 outline-none transition-shadow duration-fast placeholder:text-muted focus:shadow-gold ${
                          formErrors.gender
                            ? "border-crimson"
                            : "border-gold/40 focus:border-gold"
                        }`}
                      >
                        <option value="" disabled>
                          Chọn giới tính
                        </option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                      {formErrors.gender && (
                        <p className="text-xs text-crimson">{formErrors.gender}</p>
                      )}
                    </div>
                  </>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-md border-crimson bg-crimson/10 p-3 text-sm text-crimson"
                  >
                    {error}
                  </div>
                )}
                {forgotSent && (
                  <div
                    role="status"
                    className="rounded-md border-jade bg-jade/10 p-3 text-sm text-jade"
                  >
                    {forgotSent}
                  </div>
                )}

                {authMode === "signin" && (
                  <button
                    type="button"
                    onClick={() => toggleAuthMode("forgotpassword")}
                    className="self-start rounded-sm text-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:outline-none focus-visible:shadow-gold"
                  >
                    Quên mật khẩu?
                  </button>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting
                    ? "Đang xử lý…"
                    : authMode === "forgotpassword"
                    ? "Tiếp tục"
                    : MODE_TITLE[authMode]}
                </Button>
              </form>
            </Card>

            <p className="text-center text-xs text-muted lg:hidden">
              © Koi Feng Shui {new Date().getFullYear()}
            </p>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
