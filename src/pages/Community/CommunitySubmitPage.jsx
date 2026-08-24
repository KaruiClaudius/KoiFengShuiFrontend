import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input, notify } from "../../ui";
import { PATHS } from "../../routes/paths";
import { useCommunityStore } from "../../stores/communityStore";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export default function CommunitySubmitPage() {
  const submitPost = useCommunityStore((state) => state.submitPost);
  const submitStatus = useCommunityStore((state) => state.submitStatus);
  const submitError = useCommunityStore((state) => state.submitError);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    const valid = [];
    const problems = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        problems.push(`${file.name}: chỉ chấp nhận JPG/PNG`);
      } else if (file.size > MAX_FILE_SIZE) {
        problems.push(`${file.name}: vượt quá 5MB`);
      } else {
        valid.push(file);
      }
    }
    const next = [...images, ...valid].slice(0, MAX_IMAGES);
    setImages(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
    setErrors((prev) => ({ ...prev, images: problems[0] }));
  };

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title")?.trim() ?? "";
    const content = formData.get("content")?.trim() ?? "";

    const nextErrors = {};
    if (!title) nextErrors.title = "Vui lòng nhập tiêu đề";
    if (!content) nextErrors.content = "Vui lòng nhập nội dung";
    if (images.length === 0) nextErrors.images = "Vui lòng chọn ít nhất 1 ảnh";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const ok = await submitPost({ title, content, images });
    if (ok) {
      notify.success("Đã gửi bài viết — đang chờ duyệt.");
    } else {
      notify.error(submitError ?? "Gửi bài viết thất bại. Vui lòng thử lại.");
    }
  };

  const submitting = submitStatus === "loading";

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link to={PATHS.community} className="transition-colors duration-fast hover:text-crimson">
                Cộng đồng
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-ink-soft">
              Chia sẻ
            </li>
          </ol>
        </nav>

        <h1 className="mt-4 animate-fade-rise font-display text-3xl text-ink md:text-4xl">
          Chia sẻ cá Koi của bạn
        </h1>
        <p className="mt-2 text-muted">
          Bài viết sẽ hiển thị công khai sau khi được quản trị viên duyệt.
        </p>

        <Card className="mt-8 p-6 md:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="Tiêu đề"
              name="title"
              error={errors.title}
              aria-invalid={!!errors.title}
              placeholder="Ví dụ: Kohaku 2 tuổi của tôi"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="content" className="text-sm font-semibold text-ink">
                Nội dung
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                placeholder="Kể về chú cá Koi của bạn…"
                aria-invalid={!!errors.content}
                className={`rounded-md border bg-surface px-3.5 py-2.5 outline-none transition-shadow duration-fast placeholder:text-muted focus:shadow-gold ${
                  errors.content ? "border-crimson" : "border-gold/40 focus:border-gold"
                }`}
              />
              {errors.content && <p className="text-xs text-crimson">{errors.content}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="images" className="text-sm font-semibold text-ink">
                Hình ảnh ({images.length}/{MAX_IMAGES})
              </label>
              <input
                ref={fileInputRef}
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFilesChange}
                className="rounded-md border border-dashed border-gold/50 bg-surface px-3.5 py-3 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-crimson file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-crimson-deep"
              />
              {errors.images && <p className="text-xs text-crimson">{errors.images}</p>}
              {previews.length > 0 && (
                <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {previews.map((url, index) => (
                    <li key={`${url}-${index}`} className="group relative">
                      <img
                        src={url}
                        alt={`Ảnh ${index + 1}`}
                        className="aspect-square w-full rounded-md border border-gold/40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Xóa ảnh ${index + 1}`}
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-crimson text-xs font-bold text-white shadow-plaque"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {submitError && (
              <div role="alert" className="rounded-md border-crimson bg-crimson/10 p-3 text-sm text-crimson">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Chọn ảnh
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang gửi…" : "Gửi bài viết"}
              </Button>
            </div>
          </form>
        </Card>

        {submitStatus === "ready" && (
          <Card className="mt-6 border-jade/40 bg-jade/5 p-5">
            <p className="font-semibold text-jade">Bài viết đã được gửi thành công.</p>
            <p className="mt-1 text-sm text-muted">
              Bài của bạn đang chờ duyệt và sẽ xuất hiện trong danh sách “Bài của tôi”.
            </p>
            <Button as={Link} to={PATHS.communityMyPosts} variant="secondary" size="sm" className="mt-3">
              Xem bài chờ duyệt
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
