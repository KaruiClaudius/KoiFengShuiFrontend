import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createPost, deletePost, getAllPosts, updatePost } from "../../api/posts";
import { KoiSilhouette } from "../../assets/motifs/Motifs";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  EmptyState,
  Input,
  Skeleton,
  notify,
} from "../../ui";

const POST_CATEGORY_ID = 3;
const POST_ELEMENT_ID = 6;

const EMPTY_DRAFT = { name: "", description: "", status: "Approved" };

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ header: [1, 2, 3, false] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatCreatedAt = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
};

const StatusChip = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
      active
        ? "border-moc/30 bg-moc/10 text-moc"
        : "border-gold/30 bg-paper-2 text-muted"
    }`}
  >
    <span
      aria-hidden="true"
      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-moc" : "bg-muted"}`}
    />
    {active ? "Đã duyệt" : "Chờ duyệt"}
  </span>
);

StatusChip.propTypes = {
  active: PropTypes.bool.isRequired,
};

const FieldLabel = ({ children }) => (
  <span className="text-sm font-semibold text-ink">{children}</span>
);

FieldLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-auto h-8 w-8 text-gold"
    aria-hidden="true"
  >
    <path d="M12 16V4m0 0L8 8m4-4l4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

const PostThumbnail = ({ src, title }) =>
  src ? (
    <img
      src={src}
      alt={title}
      loading="lazy"
      className="h-14 w-20 shrink-0 rounded-md border border-gold/30 object-cover"
    />
  ) : (
    <div
      aria-hidden="true"
      className="grid h-14 w-20 shrink-0 place-items-center rounded-md border border-gold/30 bg-paper-2 text-gold"
    >
      <KoiSilhouette size={40} />
    </div>
  );

PostThumbnail.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const PostRow = ({ post, onEdit, onDelete }) => (
  <Card className="p-4 md:p-5">
    <div className="flex items-center gap-4">
      <PostThumbnail src={post.imageUrls?.[0]} title={post.name || "Bài viết"} />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug text-ink line-clamp-1">
          {post.name || "Bài viết chưa có tiêu đề"}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <StatusChip active={post.status === "Approved"} />
          <span className="text-xs text-muted">
            {formatCreatedAt(post.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <button
          type="button"
          aria-label={`Sửa bài viết ${post.name || ""}`}
          onClick={() => onEdit(post)}
          className="rounded-sm border border-ink px-3 py-1.5 text-sm font-semibold text-ink outline-none transition-colors duration-fast ease-water hover:bg-paper-2 focus-visible:shadow-gold"
        >
          Sửa
        </button>
        <button
          type="button"
          aria-label={`Xóa bài viết ${post.name || ""}`}
          onClick={() => onDelete(post)}
          className="rounded-sm px-3 py-1.5 text-sm font-semibold text-crimson outline-none transition-colors duration-fast ease-water hover:bg-paper-2 focus-visible:shadow-gold"
        >
          Xóa
        </button>
      </div>
    </div>
  </Card>
);

PostRow.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const PostSkeletonRows = () => (
  <div role="status" aria-label="Đang tải" className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <Card key={index} className="p-4 md:p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-20 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0 rounded-sm" />
        </div>
      </Card>
    ))}
  </div>
);

export default function AdminPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filesRef = useRef(newFiles);
  useEffect(() => {
    filesRef.current = newFiles;
  }, [newFiles]);
  useEffect(
    () => () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPosts();
        if (cancelled) return;
        const managedPosts = (response.data ?? []).filter(
          (post) => post.id === POST_CATEGORY_ID
        );
        setPosts(managedPosts);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const handleRetry = () => setRetryToken((token) => token + 1);

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setNewFiles([]);
    setFormOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setDraft({
      name: post.name || "",
      description: post.description || "",
      status: post.status === "Pending" ? "Pending" : "Approved",
    });
    setNewFiles([]);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setNewFiles([]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length === 0) return;
    setNewFiles((prev) => [
      ...prev,
      ...selected.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = (event) => {
    setDraft((prev) => ({
      ...prev,
      status: event.target.checked ? "Approved" : "Pending",
    }));
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      notify.error("Hãy nhập tiêu đề bài viết");
      return;
    }
    if (
      !draft.description ||
      draft.description.trim() === "" ||
      draft.description.trim() === "<p><br></p>"
    ) {
      notify.error("Hãy nhập mô tả bài viết");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("description", draft.description);
      formData.append("status", draft.status || "Approved");
      formData.append("id", POST_CATEGORY_ID);
      formData.append("elementId", POST_ELEMENT_ID);

      newFiles.forEach((item) => {
        formData.append("images", item.file);
      });

      if (editing) {
        await updatePost(editing.postId, formData);
        notify.success("Đã cập nhật bài viết");
      } else {
        await createPost(formData);
        notify.success("Đã thêm bài viết");
      }
      closeForm();
      handleRetry();
    } catch (err) {
      console.error("Error saving post", err);
      notify.error("Không thể lưu bài viết. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (post) => {
    setDeleteTarget(post);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(deleteTarget.postId);
      notify.success("Đã xóa bài viết");
      setDeleteOpen(false);
      setDeleteTarget(null);
      handleRetry();
    } catch (err) {
      console.error("Error deleting post", err);
      notify.error("Không thể xóa bài viết. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const isEmpty = !loading && !error && posts.length === 0;

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Quản lý bài viết
        </h1>
        <Button variant="primary" onClick={openCreate}>
          Thêm bài viết
        </Button>
      </div>

      {loading ? (
        <PostSkeletonRows />
      ) : error ? (
        <EmptyState
          title="Đã xảy ra lỗi khi tải bài viết"
          description="Vui lòng thử lại trong giây lát."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Thử lại
            </Button>
          }
        />
      ) : isEmpty ? (
        <EmptyState
          title="Chưa có bài viết nào"
          description="Thêm bài viết đầu tiên để hiển thị trong mục Kinh nghiệm hay."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Tải lại
            </Button>
          }
        />
      ) : (
        <div className="animate-fade-rise space-y-4">
          {posts.map((post) => (
            <PostRow
              key={post.postId ?? post.id}
              post={post}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent
          side="right"
          className="max-w-2xl overflow-y-auto"
          title={editing ? "Sửa bài viết" : "Thêm bài viết"}
          description="Bài viết sẽ xuất hiện trong mục Kinh nghiệm hay."
        >
          <div className="flex flex-col gap-5">
            <Input
              id="post-name"
              label="Tiêu đề"
              name="name"
              value={draft.name}
              onChange={handleDraftChange}
              placeholder="Nhập tiêu đề bài viết"
            />

            <div>
              <FieldLabel>Hình ảnh</FieldLabel>
              <label
                className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed border-gold/50 p-6 text-center transition-colors duration-fast ease-water hover:bg-paper-2"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  disabled={saving}
                  onChange={handleFilesChange}
                />
                <UploadIcon />
                <p className="mt-2 text-sm font-semibold text-ink">
                  Nhấp để chọn ảnh
                </p>
                <p className="mt-1 text-xs text-muted">JPG/PNG</p>
              </label>

              {(editing?.imageUrls?.length > 0 || newFiles.length > 0) && (
                <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {editing?.imageUrls?.map((url, index) => (
                    <li
                      key={`${url}-${index}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gold/40 bg-paper-2"
                    >
                      <img
                        src={url}
                        alt={`Ảnh hiện tại ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </li>
                  ))}
                  {newFiles.map((item, index) => (
                    <li
                      key={item.url}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gold/40 bg-paper-2"
                    >
                      <img
                        src={item.url}
                        alt={`Ảnh mới ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Xóa ảnh mới ${index + 1}`}
                        onClick={() => removeNewFile(index)}
                        className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-sm bg-ink/70 text-xs text-[#FDF6EC] transition-colors duration-fast ease-water hover:bg-crimson"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <FieldLabel>Mô tả</FieldLabel>
              <div className="mt-2 overflow-hidden rounded-md border border-gold/40 bg-surface transition-shadow duration-fast focus-within:border-gold focus-within:shadow-gold">
                <ReactQuill
                  theme="snow"
                  value={draft.description}
                  onChange={(value) =>
                    setDraft((prev) => ({ ...prev, description: value }))
                  }
                  modules={quillModules}
                  placeholder="Nhập nội dung bài viết"
                />
              </div>
            </div>

            <label className="inline-flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={draft.status === "Approved"}
                onChange={handleStatusToggle}
                disabled={saving}
                className="h-4 w-4 accent-[#A92C2C]"
              />
              <span className="text-[15px] text-ink-soft">
                Hiển thị trên trang
              </span>
            </label>

            <div className="mt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !open && closeDelete()}>
        <DialogContent title="Xóa bài viết này?" description={deleteTarget?.name}>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDelete}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Đang xóa…" : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
