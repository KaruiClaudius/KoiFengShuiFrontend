import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import api, { postMarketplaceListings } from "../../config/axios";
import { PATHS } from "../../routes/paths";
import { Button, Card, EmptyState, Input, notify, Skeleton } from "../../ui";
import PostListingPreview from "./PostListingPreview";

const COLOR_OPTIONS = ["Trắng", "Đỏ", "Đen", "Vàng", "Xám bạc"];
const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const EMPTY_FORM = {
  category: "",
  tittle: "",
  description: "",
  quantity: "",
  price: "",
  colors: [],
  element: "",
};

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ direction: "rtl" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

function getCurrentDateTime(daysToAdd = 0) {
  const now = new Date();
  now.setDate(now.getDate() + daysToAdd);
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const formattedDate = ` ${year}/${month < 10 ? "0" : ""}${month}/${
    day < 10 ? "0" : ""
  }${day}`;
  const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  return `${formattedDate} ${formattedTime}`;
}

const getUserIdFromLocalStorage = () => {
  try {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const userData = JSON.parse(storedData);
      return userData.accountId;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving or parsing data:", error);
    return null;
  }
};

const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-auto h-10 w-10 text-gold"
    aria-hidden="true"
  >
    <path d="M12 16V4m0 0L8 8m4-4l4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

const selectClass = (hasError) =>
  `w-full rounded-md bg-surface border px-3.5 py-2.5 outline-none transition-shadow duration-fast focus:shadow-gold ${
    hasError ? "border-crimson" : "border-gold/40 focus:border-gold"
  }`;

const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
    {children}
  </label>
);

FieldLabel.propTypes = {
  htmlFor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const FormSkeleton = () => (
  <div role="status" aria-label="Đang tải" className="grid gap-6 lg:grid-cols-[380px_1fr]">
    <Card className="p-6">
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="mt-4 h-4 w-2/3" />
    </Card>
    <Card className="space-y-6 p-6 md:p-8">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      ))}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
    </Card>
  </div>
);

const PostProperty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [elementData, setElement] = useState([]);
  const [categoryData, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(
    () => () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const responseElement = await api
          .get("/api/Element/GetAll")
          .then((response) => response.data);
        const responseMarketCategory = await api
          .get("/api/MarketCategory/GetAll")
          .then((response) => response.data);
        if (cancelled) return;
        setElement(responseElement.data);
        setCategory(responseMarketCategory.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const setValue = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length === 0) return;
    const errors = [];
    const accepted = [...files];
    selected.forEach((file) => {
      if (accepted.length >= MAX_IMAGES) {
        errors.push("Chỉ được nhiều nhất 5 bức ảnh liên quan đến sản phẩm");
        return;
      }
      if (file.size > 5000000) {
        errors.push(`${file.name} quá lớn. Kích thước tối đa là 5MB`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name} không đúng định dạng được hỗ trợ`);
        return;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    });
    setFileErrors(errors);
    setFiles(accepted);
  };

  const removeImage = (index) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const clearFiles = () => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setFiles([]);
    setFileErrors([]);
  };

  const handleColorToggle = (color) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((item) => item !== color)
        : [...prev.colors, color],
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!form.category) errors.push("Cần chọn danh mục tin đăng");
    if (!form.tittle) errors.push("Hãy nhập tiêu đề tin đăng");
    if (
      !form.description ||
      form.description.trim() === "" ||
      form.description.trim() === "<p><br></p>"
    )
      errors.push("Hãy nhập mô tả tin đăng");
    if (!form.price) errors.push("Hãy thêm giá");
    if (!form.quantity) errors.push("Hãy thêm số lượng");
    if (!form.colors || form.colors.length === 0)
      errors.push("Hãy chọn ít nhất 1 màu");
    if (!form.element) errors.push("Hãy chọn nguyên tố");
    if (files.length === 0)
      errors.push("Đăng ít nhất 1 bức ảnh liên quan đến sản phẩm");
    if (fileErrors.length > 0) errors.push(...fileErrors);
    return errors;
  };

  const handlePreview = () => {
    const missing =
      !form.tittle ||
      !form.description ||
      !form.price ||
      !form.quantity ||
      form.colors.length === 0 ||
      !form.element;
    if (missing) {
      notify.error("Vui lòng điền đầy đủ các trường bắt buộc trước khi xem trước");
      return;
    }
    setPreviewData({
      name: form.tittle,
      listingId: "Preview",
      description: form.description,
      price: form.price,
      quantity: form.quantity,
      ownerName: "Bạn",
      homeImages: files.map((item) => ({
        image: { imageUrl: item.url },
      })),
      colors: form.colors,
      elementName:
        elementData.find(
          (el) => el.elementId === Number(form.element)
        )?.elementName || "",
    });
    setShowPreview(true);
  };

  const createListing = async () => {
    const storedValues = JSON.parse(
      localStorage.getItem("pendingPropertyData")
    );
    if (!storedValues) {
      throw new Error("No pending listing data found.");
    }

    const formData = new FormData();
    const accountId = getUserIdFromLocalStorage();

    formData.append("AccountId", accountId);
    formData.append("TierId", 1);
    formData.append("Title", storedValues.tittle);
    formData.append("Description", storedValues.description);
    formData.append("Price", storedValues.price);
    formData.append("Color", storedValues.colors.join(", "));
    formData.append("Quantity", storedValues.quantity);
    formData.append("CategoryId", storedValues.category);
    formData.append("CreateAt", getCurrentDateTime());
    formData.append("ExpiresAt", getCurrentDateTime(30));
    formData.append("IsActive", true);
    formData.append("Status", "Approved");
    formData.append("ElementId", storedValues.element);

    files.forEach((item) => {
      formData.append("images", item.file);
    });

    const response = await postMarketplaceListings(formData);
    if (response.status !== 1) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    notify.success("Đăng tin thành công!");
    setForm(EMPTY_FORM);
    clearFiles();
    localStorage.removeItem("pendingPropertyData");
    navigate(PATHS.home);
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((message) => notify.error(message));
      return;
    }
    setIsLoading(true);
    try {
      const userId = getUserIdFromLocalStorage();
      if (!userId) {
        notify.error("Không tìm thấy tài khoản. Vui lòng đăng nhập.");
        return;
      }
      localStorage.setItem("pendingPropertyData", JSON.stringify(form));
      await createListing();
    } catch (err) {
      console.error("Lỗi Đăng Tin:", err);
      notify.error("Đăng tin thất bại. Xin hãy thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen grain-bg bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <FormSkeleton />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen grain-bg bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            title="Đã xảy ra lỗi"
            description="Không thể tải dữ liệu đăng tin. Vui lòng thử lại."
            action={
              <Button onClick={() => setRetryToken((token) => token + 1)}>
                Thử lại
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  if (showPreview && previewData) {
    return (
      <main className="min-h-screen grain-bg bg-paper pb-16">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <PostListingPreview propertyDetails={previewData} />
          <Button
            variant="secondary"
            className="mt-8 w-full"
            onClick={() => setShowPreview(false)}
          >
            Trở Lại Đăng Tin
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grain-bg bg-paper pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-x-2 text-sm text-muted"
        >
          <Link
            to={PATHS.home}
            className="transition-colors duration-fast ease-water hover:text-crimson"
          >
            Trang chủ
          </Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page" className="font-medium text-ink-soft">
            Đăng tin
          </span>
        </nav>

        <h1 className="mt-5 font-display text-3xl leading-tight text-ink md:text-4xl">
          Đăng tin mới
        </h1>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="p-6">
            <h3 className="font-display text-lg text-ink">Hình ảnh</h3>
            <label
              className={`mt-4 block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-fast ease-water ${
                files.length >= MAX_IMAGES
                  ? "cursor-not-allowed border-gold/30 opacity-60"
                  : "border-gold/50 hover:bg-paper-2"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png"
                className="sr-only"
                disabled={files.length >= MAX_IMAGES || isLoading}
                onChange={handleFilesChange}
              />
              <UploadIcon />
              <p className="mt-3 font-semibold text-ink">
                Đăng từ 1-{MAX_IMAGES} hình
              </p>
              <p className="mt-1 text-sm text-muted">
                Nhấp để chọn ảnh · JPG/PNG · tối đa 5MB mỗi ảnh
              </p>
            </label>

            {files.length > 0 && (
              <ul className="mt-5 grid grid-cols-3 gap-3">
                {files.map((item, index) => (
                  <li
                    key={item.url}
                    className="relative aspect-square overflow-hidden rounded-md border border-gold/40 bg-paper-2"
                  >
                    <img
                      src={item.url}
                      alt={`Ảnh ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Xóa ảnh ${index + 1}`}
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-sm bg-ink/70 text-xs text-[#FDF6EC] transition-colors duration-fast ease-water hover:bg-crimson"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {fileErrors.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs text-crimson" role="alert">
                {fileErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="space-y-6 p-6 md:p-8">
            <div>
              <FieldLabel htmlFor="category">Danh mục</FieldLabel>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(event) =>
                  setValue("category", Number(event.target.value))
                }
                className={`mt-2 ${selectClass(false)}`}
              >
                <option value="">Chọn một loại tin đăng</option>
                {categoryData.map((category) => (
                  <option key={category.categoryid} value={category.categoryid}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Tiêu đề"
              name="tittle"
              placeholder="Tiêu đề tin đăng"
              value={form.tittle}
              onChange={(event) => setValue("tittle", event.target.value)}
            />

            <div>
              <FieldLabel htmlFor="description">Mô tả chi tiết</FieldLabel>
              <div className="mt-2 overflow-hidden rounded-md border border-gold/40 bg-surface transition-shadow duration-fast focus-within:border-gold focus-within:shadow-gold">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => setValue("description", value)}
                  modules={quillModules}
                  placeholder="Mô tả chi tiết"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="quantity">Số lượng</FieldLabel>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Số lượng cá"
                  value={form.quantity}
                  onChange={(event) => setValue("quantity", event.target.value)}
                  className={`mt-2 ${selectClass(false)}`}
                />
              </div>
              <div>
                <FieldLabel htmlFor="price">Giá</FieldLabel>
                <div className="relative mt-2">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Giá"
                    value={form.price}
                    onChange={(event) => setValue("price", event.target.value)}
                    className={`${selectClass(false)} pr-14`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">
                    VNĐ
                  </span>
                </div>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Màu sắc</legend>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2.5">
                {COLOR_OPTIONS.map((color) => (
                  <label
                    key={color}
                    className="inline-flex cursor-pointer items-center gap-2 text-[15px] text-ink-soft"
                  >
                    <input
                      type="checkbox"
                      name="colors"
                      value={color}
                      checked={form.colors.includes(color)}
                      onChange={() => handleColorToggle(color)}
                      className="h-4 w-4 accent-[#A92C2C]"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">
                Bản mệnh
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2.5">
                {elementData.map((element) => (
                  <label
                    key={element.elementId}
                    className="inline-flex cursor-pointer items-center gap-2 text-[15px] text-ink-soft"
                  >
                    <input
                      type="radio"
                      name="element"
                      value={element.elementId}
                      checked={String(form.element) === String(element.elementId)}
                      onChange={() =>
                        setValue("element", Number(element.elementId))
                      }
                      className="h-4 w-4 accent-[#A92C2C]"
                    />
                    {element.elementName}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreview}
                disabled={isLoading}
              >
                Xem trước
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Đang đăng tin…" : "Đăng Tin"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default PostProperty;
