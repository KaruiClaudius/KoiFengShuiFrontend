import { useEffect, useState } from "react";
import { getAllFAQs } from "../../api/faqs";
import { Button, EmptyState, Skeleton } from "../../ui";

function FaqSkeletonRows() {
  return (
    <div role="status" aria-label="Đang tải" className="divide-y divide-gold/20">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="px-5 py-4">
          <Skeleton className="h-5 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function FAQDisplay() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <FaqSkeletonRows />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Đã xảy ra lỗi khi tải câu hỏi"
          description="Vui lòng thử lại trong giây lát."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Chưa có câu hỏi nào" />
      </div>
    );
  }

  return (
    <div className="animate-fade-rise mx-auto max-w-3xl border-t border-gold/30">
      {faqs.map((faq) => (
        <details
          key={faq.faqId}
          className="group border-b border-gold/30 last:border-b-0"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md px-5 py-4 transition-colors duration-fast hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
            <span className="font-semibold text-ink">{faq.question}</span>
            <span
              aria-hidden="true"
              className="shrink-0 text-muted transition-transform duration-fast ease-water group-open:rotate-180"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <p className="whitespace-pre-line px-5 pb-4 text-sm leading-relaxed text-ink-soft">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
