import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { getFeed } from "../../api/community";
import { extractApiError } from "../../api/core";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  EmptyState,
  Skeleton,
} from "../../ui";
import { CloudDivider, KoiSilhouette, WaveBand } from "../../assets/motifs/Motifs";
import FAQDisplay from "../FAQ/FAQDisplay";
import { PATHS } from "../../routes/paths";
import "./Homepage.css";

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [communityPosts, setCommunityPosts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const fetchDataRef = useRef(null);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `${PATHS.community}?q=${encodeURIComponent(term)}` : PATHS.community);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [communityResponse, blogResponse] = await Promise.all([
          getFeed({ postTypeId: 1, page: 1, pageSize: 6 }),
          getFeed({ postTypeId: 3, page: 1, pageSize: 6 }),
        ]);

        if (cancelled) return;
        setCommunityPosts(communityResponse.data?.data ?? communityResponse.data ?? []);
        setBlogPosts(blogResponse.data?.data ?? blogResponse.data ?? []);
      } catch (err) {
        if (!cancelled) setError(extractApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    fetchDataRef.current = fetchData;

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPosts = communityPosts.length > 0 || blogPosts.length > 0;

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
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="mt-8 flex w-full max-w-md items-stretch gap-3"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm bài viết kinh nghiệm hay…"
              aria-label="Tìm bài viết kinh nghiệm hay"
              autoComplete="off"
              className="w-full min-w-0 rounded-full border border-[#E6D9A8]/40 bg-white/10 px-5 py-3 text-[#FDF6EC] outline-none transition-shadow duration-fast ease-water placeholder:text-[#E6D9A8]/70 focus:shadow-gold"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#E6D9A8]/60 px-4 text-[#E6D9A8] transition-all duration-fast ease-water hover:bg-[#E6D9A8]/10 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-gold"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/blog" size="lg">
              Đọc kinh nghiệm hay
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
        ) : !hasPosts ? (
          <EmptyState
            title="Chưa có nội dung nào"
            description="Bài viết cộng đồng và kinh nghiệm hay sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="space-y-14 md:space-y-20">
            {communityPosts.length > 0 && (
              <Rail title="Cộng đồng" moreTo={PATHS.community}>
                {communityPosts.map((item) => (
                  <BlogCard
                    key={`community-${item.postId}`}
                    post={item}
                    onOpen={setSelectedPost}
                  />
                ))}
              </Rail>
            )}
            {blogPosts.length > 0 && (
              <Rail title="Kinh Nghiệm Hay" moreTo={PATHS.blog}>
                {blogPosts.map((item) => (
                  <BlogCard
                    key={`blog-${item.postId}`}
                    post={item}
                    onOpen={setSelectedPost}
                  />
                ))}
              </Rail>
            )}
            <section aria-label="Đối tác">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Đối tác uy tín
                </h2>
                <Link
                  to={PATHS.partners}
                  className="shrink-0 text-sm font-semibold text-crimson transition-colors duration-fast hover:text-crimson-deep focus-visible:outline-none focus-visible:shadow-gold rounded-sm"
                >
                  Xem tất cả <span aria-hidden="true">›</span>
                </Link>
              </div>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
                <p className="max-w-xl text-sm leading-relaxed text-muted">
                  Cửa hàng cá Koi & vật tư hồ thủy sinh được hệ thống tin cậy.
                  Bạn mua sắm — chúng tôi định hướng.
                </p>
                <Button as={Link} to={PATHS.partners} variant="secondary">
                  Khám phá đối tác
                </Button>
              </Card>
            </section>
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
