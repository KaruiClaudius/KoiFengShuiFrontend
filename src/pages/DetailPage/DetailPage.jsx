import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import api, { getFengShuiKoiDetail } from "../../config/axios";
import { Badge, Button, Card, EmptyState, notify, Skeleton } from "../../ui";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";
import usericon from "../../assets/icons/userIcon.png";

const ELEMENT_KEY_BY_NAME = {
  Kim: "kim",
  Mộc: "moc",
  Thuỷ: "thuy",
  Hoả: "hoa",
  Thổ: "tho",
};

const dicebearAvatar = (accountName) =>
  `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(accountName)}`;

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ImageGallery = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = Array.isArray(images)
    ? images.filter((image) => image?.image?.imageUrl)
    : [];

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-gold/40 bg-paper-2">
        <KoiSilhouette size={96} className="text-gold" />
      </div>
    );
  }

  const index = Math.min(activeIndex, safeImages.length - 1);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gold/40 bg-paper-2 shadow-plaque">
        <img
          src={safeImages[index].image.imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((image, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Xem hình ${idx + 1}`}
              aria-pressed={idx === index}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-sm transition-all duration-fast ease-water ${
                idx === index
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-paper"
                  : "opacity-70 ring-1 ring-gold/30 hover:opacity-100 hover:ring-gold/60"
              }`}
            >
              <img
                src={image.image.imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.shape({ imageUrl: PropTypes.string }),
    })
  ),
  title: PropTypes.string,
};

const DetailSkeleton = () => (
  <div role="status" aria-label="Đang tải" className="grid gap-8 lg:grid-cols-12">
    <div className="lg:col-span-7">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="mt-3 flex gap-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="aspect-[4/3] w-20" />
        ))}
      </div>
    </div>
    <div className="lg:col-span-5">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full">
            <Skeleton className="h-full w-full" />
          </div>
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="mt-8 space-y-5">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-8 h-12 w-full" />
      </Card>
    </div>
  </div>
);

const RelatedRail = ({ title, seeMoreTo, items, to }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl text-ink md:text-[28px]">{title}</h2>
        {seeMoreTo && (
          <Link
            to={seeMoreTo}
            className="shrink-0 text-sm font-semibold text-crimson transition-colors duration-fast ease-water hover:text-crimson-deep"
          >
            Xem thêm
          </Link>
        )}
      </div>
      <div className="-mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {items.map((item) => (
          <div key={item.listingId} className="w-64 shrink-0 snap-start sm:w-72">
            <ListingCard item={item} to={to} />
          </div>
        ))}
      </div>
    </section>
  );
};

RelatedRail.propTypes = {
  title: PropTypes.string.isRequired,
  seeMoreTo: PropTypes.string,
  items: PropTypes.array,
  to: PropTypes.string.isRequired,
};

const DetailPage = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [koiDetail, setKoiDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedByElement, setRelatedByElement] = useState([]);
  const [relatedByAccount, setRelatedByAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowPhone(false);
        setKoiDetail(null);
        setRelatedByElement([]);
        setRelatedByAccount([]);
        const response = await getFengShuiKoiDetail(id);
        if (cancelled) return;
        const detail = response.data[0];
        setKoiDetail(detail);

        if (detail) {
          const [elementListings, accountListings, categoryList] =
            await Promise.all([
              api
                .get(
                  `/api/MarketplaceListings/GetAllByElementId/${detail.elementId}/Category/${detail.categoryId}?excludeListingId=${id}&page=1&pageSize=10`
                )
                .then((res) => res.data),
              api
                .get(
                  `/api/MarketplaceListings/GetAllByAccount/${detail.accountId}/Category/${detail.categoryId}?excludeListingId=${id}&page=1&pageSize=10`
                )
                .then((res) => res.data),
              api.get("/api/MarketCategory/GetAll").then((res) => res.data),
            ]);
          if (cancelled) return;
          setRelatedByElement(
            Array.isArray(elementListings.data) ? elementListings.data : []
          );
          setRelatedByAccount(
            Array.isArray(accountListings.data) ? accountListings.data : []
          );
          setCategories(
            Array.isArray(categoryList.data) ? categoryList.data : []
          );
        }
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
  }, [id, retryToken]);

  if (loading) {
    return (
      <main className="min-h-screen grain-bg bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <DetailSkeleton />
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
            description="Không thể tải chi tiết tin đăng. Vui lòng thử lại."
            action={
              <Button
                type="button"
                onClick={() => setRetryToken((token) => token + 1)}
              >
                Thử lại
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  if (!koiDetail) {
    return (
      <main className="min-h-screen grain-bg bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            title="Không tìm thấy tin đăng"
            description="Tin đăng bạn cần không tồn tại hoặc đã được gỡ bỏ."
            action={
              <Button as={Link} to="/" variant="secondary">
                Về trang chủ
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  const hasElement = Boolean(
    koiDetail.elementName && koiDetail.elementName !== "Non element"
  );
  const categoryName = categories.find(
    (category) => category.categoryid === koiDetail.categoryId
  )?.categoryName;
  const ownerAvatar = koiDetail.accountName
    ? dicebearAvatar(koiDetail.accountName)
    : usericon;

  const handlePhoneClick = () => {
    if (!isLoggedIn) {
      notify.error("Đăng nhập để xem số điện thoại");
      return;
    }
    setShowPhone((visible) => !visible);
  };

  return (
    <main className="min-h-screen grain-bg bg-paper pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted"
        >
          <Link
            to="/"
            className="transition-colors duration-fast ease-water hover:text-crimson"
          >
            Trang chủ
          </Link>
          {categoryName && (
            <>
              <span aria-hidden="true">›</span>
              <Link
                to="/KoiListings"
                className="transition-colors duration-fast ease-water hover:text-crimson"
              >
                {categoryName}
              </Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span
            aria-current="page"
            className="min-w-0 truncate font-medium text-ink-soft"
          >
            {koiDetail.title}
          </span>
        </nav>

        <h1 className="mt-5 font-display text-3xl leading-tight text-ink md:text-4xl">
          {hasElement ? `[${koiDetail.elementName}] ` : ""}
          {koiDetail.title}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ImageGallery
              key={koiDetail.listingId ?? id}
              images={koiDetail.listingImages}
              title={koiDetail.title}
            />
          </div>

          <Card className="h-fit p-6 lg:col-span-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <img
                src={ownerAvatar}
                alt={koiDetail.accountName || ""}
                className="h-16 w-16 rounded-full border-2 border-gold/50 bg-paper-2 object-cover"
              />
              <h2 className="font-display text-xl text-ink">
                {koiDetail.accountName}
              </h2>
            </div>

            <dl className="mt-6 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-gold/25 py-3">
                <dt className="shrink-0 text-muted">Số lượng</dt>
                <dd className="text-right font-medium text-ink">
                  {koiDetail.quantity}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-gold/25 py-3">
                <dt className="shrink-0 text-muted">Màu sắc</dt>
                <dd className="text-right font-medium text-ink">
                  {koiDetail.color}
                </dd>
              </div>
              {hasElement && (
                <div className="flex items-center justify-between gap-4 border-b border-gold/25 py-3">
                  <dt className="shrink-0 text-muted">Bản mệnh</dt>
                  <dd className="text-right">
                    <Badge element={ELEMENT_KEY_BY_NAME[koiDetail.elementName]}>
                      {koiDetail.elementName}
                    </Badge>
                  </dd>
                </div>
              )}
            </dl>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              aria-label="Hiện số điện thoại"
              onClick={handlePhoneClick}
            >
              <PhoneIcon />
              <span className="truncate">
                {showPhone ? koiDetail.accountPhoneNumber : "Hiện số điện thoại"}
              </span>
            </Button>
          </Card>
        </div>

        <CloudDivider className="mx-auto mt-12 max-w-xs text-gold" />

        <Card className="mt-10 p-6">
          <h2 className="font-display text-2xl text-ink">Mô tả</h2>
          <div
            className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-soft [&_a]:font-medium [&_a]:text-crimson [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-3 [&_img]:rounded-md [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(koiDetail.description || ""),
            }}
          />
        </Card>

        {hasElement && (
          <RelatedRail
            title={`${categoryName ? `${categoryName} ` : ""}Cùng bản mệnh`}
            seeMoreTo={`/KoiListings?category=1&element=${koiDetail.elementId}`}
            items={relatedByElement}
            to="/Details"
          />
        )}

        <RelatedRail
          title={`${categoryName ? `${categoryName} ` : ""}Tin liên quan`}
          items={relatedByAccount}
          to="/Details"
        />
      </div>
    </main>
  );
};

export default DetailPage;
