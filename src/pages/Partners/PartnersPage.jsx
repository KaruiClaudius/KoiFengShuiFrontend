import { useEffect, useState } from "react";
import { Button, Card, EmptyState, Skeleton } from "../../ui";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";
import { getPartners } from "../../api/partners";
import { extractApiError } from "../../api/core";

const PartnerSkeleton = () => (
  <div
    role="status"
    aria-label="Đang tải"
    className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-3 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-4/5" />
      </Card>
    ))}
  </div>
);

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchPartners = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPartners();
        if (!cancelled) setPartners(response.data ?? []);
      } catch (err) {
        if (!cancelled) setError(extractApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPartners();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <section className="animate-fade-rise mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20 lg:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
          Đối tác uy tín
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Danh sách các cửa hàng cá Koi & vật tư hồ thủy sinh được hệ thống tin
          cậy — bạn mua sắm, chúng tôi định hướng.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <PartnerSkeleton />
        ) : error ? (
          <EmptyState
            title="Đã xảy ra lỗi khi tải dữ liệu"
            description={error}
            action={
              <Button onClick={() => setReloadToken((token) => token + 1)}>
                Thử lại
              </Button>
            }
          />
        ) : partners.length === 0 ? (
          <EmptyState
            title="Chưa có đối tác nào"
            description="Danh sách đối tác sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <Card key={partner.id} className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-paper-2 text-gold"
                  >
                    <KoiSilhouette size={22} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold text-ink">
                      {partner.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">{partner.address}</p>
                  </div>
                </div>
                {partner.note && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {partner.note}
                  </p>
                )}
                {partner.linkUrl && (
                  <a
                    href={partner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:shadow-gold"
                  >
                    Truy cập cửa hàng <span aria-hidden="true">→</span>
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <CloudDivider className="mx-auto max-w-md text-gold/70" />
    </main>
  );
}
