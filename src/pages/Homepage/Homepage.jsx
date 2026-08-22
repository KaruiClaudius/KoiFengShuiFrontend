import { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  getAllPosts,
  getFengShuiKoiDecorationPost,
  getFengShuiKoiFishPost,
  getKoiElement,
} from "../../config/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  EmptyState,
  Skeleton,
} from "../../ui";
import { CloudDivider, KoiSilhouette, WaveBand } from "../../assets/motifs/Motifs";
import FAQDisplay from "../FAQ/FAQDisplay";
import "./Homepage.css";

const ELEMENT_KEY_MAP = {
  Kim: "kim",
  Mộc: "moc",
  Thủy: "thuy",
  Hỏa: "hoa",
  Thổ: "tho",
};

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const avatarUrl = (name) =>
  name
    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
    : null;

function Rail({ title, moreTo, children }) {
  const trackRef = useRef(null);
  const scrollByAmount = (direction) =>
    trackRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });

  return (
    <section aria-label={title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          {title}
        </h2>
        <Link
          to={moreTo}
          aria-label={`Xem thêm ${title}`}
          className="shrink-0 text-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:outline-none focus-visible:shadow-gold rounded-sm"
        >
          Xem thêm <span aria-hidden="true">›</span>
        </Link>
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Trước"
          onClick={() => scrollByAmount(-1)}
          className="absolute -left-3 top-[34%] z-10 hidden h-10 w-10 place-items-center rounded-full border border-gold/40 bg-surface text-lg text-ink shadow-plaque transition-all duration-fast ease-water hover:bg-paper-2 active:scale-95 focus-visible:outline-none focus-visible:shadow-gold lg:grid"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {children}
        </div>
        <button
          type="button"
          aria-label="Sau"
          onClick={() => scrollByAmount(1)}
          className="absolute -right-3 top-[34%] z-10 hidden h-10 w-10 place-items-center rounded-full border border-gold/40 bg-surface text-lg text-ink shadow-plaque transition-all duration-fast ease-water hover:bg-paper-2 active:scale-95 focus-visible:outline-none focus-visible:shadow-gold lg:grid"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}

Rail.propTypes = {
  title: PropTypes.string.isRequired,
  moreTo: PropTypes.string.isRequired,
  children: PropTypes.node,
};

function KoiCard({ item }) {
  const elementKey = ELEMENT_KEY_MAP[item.elementName];
  const imageUrl = item.listingImages?.[0]?.image?.imageUrl;
  const avatar = avatarUrl(item.accountName);

  return (
    <Card interactive className="w-[260px] shrink-0 snap-start overflow-hidden sm:w-[280px]">
      <Link
        to={`/Details/${item.listingId}`}
        className="flex h-full flex-col rounded-lg outline-none focus-visible:shadow-gold"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-slow ease-water hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-gold/60">
              <KoiSilhouette size={64} />
            </div>
          )}
          {elementKey && (
            <Badge element={elementKey} className="absolute left-3 top-3">
              {item.elementName}
            </Badge>
          )}
          {item.tierName === "Tin Nổi Bật" && (
            <Badge className="absolute right-3 top-3">Nổi bật</Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {item.title}
          </h3>
          <div className="mt-auto flex items-center gap-2">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className="rounded-full border border-gold/40 bg-surface"
              />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-full border border-gold/40 bg-paper-2 text-xs text-muted" aria-hidden="true">
                鯉
              </span>
            )}
            <span className="truncate text-xs text-muted">{item.accountName}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

KoiCard.propTypes = {
  item: PropTypes.shape({
    listingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string,
    elementName: PropTypes.string,
    tierName: PropTypes.string,
    accountName: PropTypes.string,
    listingImages: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({ imageUrl: PropTypes.string }),
      })
    ),
  }).isRequired,
};

function BlogCard({ post, onOpen }) {
  const imageUrl = post.imageUrls?.[0];

  return (
    <Card interactive className="w-[280px] shrink-0 snap-start overflow-hidden sm:w-[320px]">
      <button
        type="button"
        onClick={() => onOpen(post)}
        className="block h-full w-full rounded-lg text-left outline-none focus-visible:shadow-gold"
      >
        <div className="aspect-video overflow-hidden bg-paper-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-slow ease-water hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-gold/60">
              <KoiSilhouette size={56} flip />
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {post.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {stripHtml(post.description)}
          </p>
        </div>
      </button>
    </Card>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    description: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
};

function KoiSkeletonGrid() {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function Homepage() {
  const { user } = useAuth();
  const currentUser = user ?? null;

  const [cardDataKoiElement, setCardDataKoiElement] = useState([]);
  const [cardDataKoi, setCardDataKoi] = useState([]);
  const [cardDataDecoration, setCardDataDecoration] = useState([]);
  const [cardDataPost, setCardDataPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const fetchDataRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const responseKoi = await getFengShuiKoiFishPost(1);
        const responseDecoration = await getFengShuiKoiDecorationPost(2);
        const responsePost = await getAllPosts();

        if (cancelled) return;
        setCardDataKoi(responseKoi.data);
        setCardDataDecoration(responseDecoration.data);
        setCardDataPost(responsePost.data);

        if (currentUser?.elementId) {
          const responseKoiElement = await getKoiElement(currentUser.elementId, 1, 10);
          if (!cancelled) setCardDataKoiElement(responseKoiElement.data ?? []);
        } else {
          if (!cancelled) setCardDataKoiElement([]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    fetchDataRef.current = fetchData;

    return () => {
      cancelled = true;
    };
  }, [currentUser?.elementId]);

  const activePosts = cardDataPost.filter((post) => post.status === "active");

  const hasElementKoi = cardDataKoiElement.length > 0;
  const hasKoi = cardDataKoi.length > 0;
  const hasDecoration = cardDataDecoration.length > 0;
  const hasAnyKoi = hasElementKoi || hasKoi || hasDecoration;

  const rails = [
    hasElementKoi && {
      key: "element",
      title: "Cá Koi Theo Bản Mệnh",
      moreTo: `/KoiListings?category=1&element=${currentUser.elementId}`,
      items: cardDataKoiElement,
      kind: "koi",
    },
    hasKoi && {
      key: "koi",
      title: "Bán Cá Koi",
      moreTo: "/KoiListings?category=1",
      items: cardDataKoi,
      kind: "koi",
    },
    hasDecoration && {
      key: "decoration",
      title: "Đồ Trang Trí Hồ Cá",
      moreTo: "/KoiListings?category=2",
      items: cardDataDecoration,
      kind: "koi",
    },
    activePosts.length > 0 && {
      key: "blog",
      title: "Kinh Nghiệm Hay",
      moreTo: "/blog",
      items: activePosts,
      kind: "blog",
    },
  ].filter(Boolean);

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <section className="relative overflow-hidden bg-pond text-[#FDF6EC]">
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 md:pb-32 md:pt-24 lg:px-8 animate-fade-rise">
          <h1 className="font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
            <span className="block text-gold-soft pb-1">Koi</span>
            <span className="block text-[#FDF6EC]">FengShui</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#E6D9A8]/90 md:text-lg">
            Cân Bằng Phong Thủy, Koi Vượng Tài Lộc.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/KoiListings?category=1" size="lg">
              Khám phá cá Koi
            </Button>
            <Link
              to="/KoiCompatible"
              className="inline-flex select-none items-center justify-center rounded-md border border-[#E6D9A8]/60 px-7 py-3.5 text-base font-semibold text-[#E6D9A8] transition-all duration-fast ease-water hover:bg-[#E6D9A8]/10 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-gold"
            >
              Tư vấn bản mệnh
            </Link>
          </div>
        </div>
        <WaveBand
          height={72}
          color="#C9A227"
          opacity={0.18}
          className="pointer-events-none absolute inset-x-0 bottom-0"
        />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        {loading ? (
          <KoiSkeletonGrid />
        ) : error ? (
          <EmptyState
            title="Đã xảy ra lỗi khi tải dữ liệu"
            description="Vui lòng thử lại trong giây lát."
            action={
              <Button variant="primary" onClick={() => fetchDataRef.current?.()}>
                Thử lại
              </Button>
            }
          />
        ) : !hasAnyKoi ? (
          <EmptyState
            title="Không tìm thấy kết quả phù hợp"
            description="Hiện chưa có cá Koi hoặc đồ trang trí nào để hiển thị."
          />
        ) : (
          <div className="space-y-14 md:space-y-20">
            {rails.map((rail, index) => (
              <Fragment key={rail.key}>
                {index > 0 && (
                  <CloudDivider className="mx-auto max-w-md text-gold/70" />
                )}
                <Rail title={rail.title} moreTo={rail.moreTo}>
                  {rail.items.map((item) =>
                    rail.kind === "koi" ? (
                      <KoiCard key={item.listingId} item={item} />
                    ) : (
                      <BlogCard key={`${item.id}-${item.name}`} post={item} onOpen={setSelectedPost} />
                    )
                  )}
                </Rail>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <CloudDivider className="mx-auto max-w-md text-gold/70" />

      <FAQDisplay />

      <Dialog
        open={Boolean(selectedPost)}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null);
        }}
      >
        <DialogContent title={selectedPost?.name}>
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.imageUrls?.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`${selectedPost.name} — ảnh ${index + 1}`}
                  loading="lazy"
                  className="w-full rounded-md object-cover"
                />
              ))}
              <p className="text-sm leading-relaxed text-ink-soft">
                {stripHtml(selectedPost.description)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
