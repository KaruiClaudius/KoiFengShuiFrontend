import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createFAQ, deleteFAQ, getAllFAQs, updateFAQ } from "../../api/faqs";
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

function FaqRow({ faq, onEdit, onDelete }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink">{faq.question}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {faq.answer}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label="Sửa"
            onClick={() => onEdit(faq)}
            className="grid h-9 w-9 place-items-center rounded-md text-muted outline-none transition-colors duration-fast hover:bg-paper-2 hover:text-crimson focus-visible:shadow-gold"
          >
            <svg
              aria-hidden="true"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Xóa"
            onClick={() => onDelete(faq)}
            className="grid h-9 w-9 place-items-center rounded-md text-muted outline-none transition-colors duration-fast hover:bg-paper-2 hover:text-crimson focus-visible:shadow-gold"
          >
            <svg
              aria-hidden="true"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

FaqRow.propTypes = {
  faq: PropTypes.shape({
    faqId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    question: PropTypes.string,
    answer: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function FaqSkeletonRows() {
  return (
    <div role="status" aria-label="Đang tải" className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="space-y-3 p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  );
}

const EMPTY_DRAFT = { question: "", answer: "" };

export default function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllFAQs();
        if (cancelled) return;
        setFaqs(response.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFaqs();

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const handleRetry = () => setRetryToken((token) => token + 1);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (faq) => {
    setDraft({ ...faq });
    setEditingId(faq.faqId);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId != null) {
        await updateFAQ(editingId, draft);
        setFaqs((prev) =>
          prev.map((faq) => (faq.faqId === editingId ? draft : faq))
        );
        notify.success("Đã cập nhật câu hỏi");
      } else {
        const response = await createFAQ({ ...draft });
        setFaqs((prev) => [...prev, response.data]);
        notify.success("Đã thêm câu hỏi");
      }
      setFormOpen(false);
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving FAQ", err);
      notify.error("Không thể lưu câu hỏi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (faq) => {
    setDeleteTarget(faq);
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
      await deleteFAQ(deleteTarget.faqId);
      notify.success("Đã xóa");
      setDeleteOpen(false);
      setDeleteTarget(null);
      handleRetry();
    } catch (err) {
      console.error("Error deleting FAQ", err);
      notify.error("Không thể xóa câu hỏi. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const canSave = draft.question.trim() !== "" && draft.answer.trim() !== "";

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Quản lý FAQ
        </h1>
        <Button variant="primary" onClick={openCreate}>
          Thêm câu hỏi
        </Button>
      </div>

      {loading ? (
        <FaqSkeletonRows />
      ) : error ? (
        <EmptyState
          title="Đã xảy ra lỗi khi tải câu hỏi"
          description="Vui lòng thử lại trong giây lát."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Thử lại
            </Button>
          }
        />
      ) : faqs.length === 0 ? (
        <EmptyState
          title="Chưa có FAQ nào"
          description="Thêm câu hỏi đầu tiên để hiển thị trên trang chủ."
          action={
            <Button variant="primary" onClick={openCreate}>
              Thêm câu hỏi
            </Button>
          }
        />
      ) : (
        <div className="animate-fade-rise space-y-4">
          {faqs.map((faq) => (
            <FaqRow
              key={faq.faqId}
              faq={faq}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent
          side="right"
          title={editingId != null ? "Sửa câu hỏi" : "Thêm câu hỏi"}
          description="Câu hỏi sẽ xuất hiện trong mục Hỏi đáp trên trang chủ."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSave && !saving) handleSave();
            }}
          >
            <Input
              id="faq-question"
              label="Câu hỏi"
              name="question"
              value={draft.question}
              onChange={handleDraftChange}
              placeholder="Nhập câu hỏi"
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="faq-answer"
                className="text-sm font-semibold text-ink"
              >
                Câu trả lời
              </label>
              <textarea
                id="faq-answer"
                name="answer"
                value={draft.answer}
                onChange={handleDraftChange}
                placeholder="Nhập câu trả lời"
                className="min-h-[120px] resize-y rounded-md border border-gold/40 bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-ink outline-none transition-shadow duration-fast placeholder:text-muted focus:border-gold focus:shadow-gold"
              />
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={!canSave || saving}>
                {saving ? "Đang lưu…" : "Lưu"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !open && closeDelete()}
      >
        <DialogContent
          title="Xóa câu hỏi này?"
          description={deleteTarget?.question}
        >
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
