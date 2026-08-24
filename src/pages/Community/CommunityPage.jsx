import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
} from "../../ui";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { useCommunityStore } from "../../stores/communityStore";
import { POST_STATUS_LABELS } from "../../constants/postTypes";

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function CommunityCard({ post }) {
  const imageUrl = post.imageUrls?.[0];
  const statusLabel = POST_STATUS_LABELS[post.status];

  return (
    <Card interactive className="w-[280px] shrink-0 snap-start overflow-hidden sm:w-[320px]">
      <Link
        to={`/community/${post.postId}`}
        className="block h-full w-full rounded-lg outline-none focus-visible:shadow-gold"
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
          <div className="flex items-center gap-2">
            {post.elementName && (
              <Badge>{post.elementName}</Badge>
            )}
            {statusLabel && <Badge className="ml-auto">{statusLabel}</Badge>}
          </div>
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {post.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {stripHtml(post.description)}
          </p>
          <p className="text-xs text-muted">{post.accountName}</p>
        </div>
      </Link>
    </Card>
  );
}

CommunityCard.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    accountName: PropTypes.string,
    elementName: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

const FeedSkeleton = () => (
  <div
    role="status"
    aria-label="Đang tải"
    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    {Array.from({ length: 8 }).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <Skeleton className="aspect-video rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
);

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const feed = useCommunityStore((state) => state.feed);
  const status = useCommunityStore((state) => state.status);
  const error = useCommunityStore((state) => state.error);
  const hasMore = useCommunityStore((state) => state.hasMore);
  const fetchFeed = useCommunityStore((state) => state.fetchFeed);
  const search = useCommunityStore((state) => state.search);
  const loadMore = useCommunityStore((state) => state.loadMore);

  useEffect(() => {
    fetchFeed({ append: false });
  }, [fetchFeed]);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("q")?.trim() ?? "";
    setSearchParams(term ? { q: term } : {});
    search(term);
  };

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <section className="bg-pond text-[#FDF6EC]">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16 lg:px-8 animate-fade-rise">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
            Cộng đồng
          </h1>
          <p className="mt-3 max-w-xl text-[#E6D9A8]/90">
            Nơi chia sẻ chú cá Koi của bạn và câu chuyện chăm sóc hồ thủy sinh.
          </p>
          <form
            role="search"
            onSubmit={handleSearch}
            className="mt-6 flex w-full max-w-md items-stretch gap-3"
          >
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm bài viết cộng đồng…"
              aria-label="Tìm bài viết cộng đồng"
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
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <>
                <Button as={Link} to={PATHS.communitySubmit} size="lg">
                  Chia sẻ cá Koi của bạn
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(PATHS.communityMyPosts)}
                >
                  Bài của tôi
                </Button>
              </>
            ) : (
              <Button as={Link} to={PATHS.auth} size="lg">
                Đăng nhập để chia sẻ
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {status === "loading" && feed.length === 0 ? (
          <FeedSkeleton />
        ) : status === "error" ? (
          <EmptyState
            title="Đã xảy ra lỗi khi tải dữ liệu"
            description={error ?? "Vui lòng thử lại trong giây lát."}
            action={
              <Button onClick={() => fetchFeed({ append: false })}>Thử lại</Button>
            }
          />
        ) : feed.length === 0 ? (
          <EmptyState
            title={q ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết cộng đồng"}
            description={
              q
                ? "Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm."
                : "Hãy là người đầu tiên chia sẻ chú cá Koi của bạn!"
            }
            action={
              isLoggedIn ? (
                <Button as={Link} to={PATHS.communitySubmit}>
                  Viết bài mới
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {feed.map((post) => (
                <CommunityCard key={`${post.postId}-${post.name}`} post={post} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button variant="secondary" size="lg" onClick={loadMore} disabled={status === "loading"}>
                  {status === "loading" ? "Đang tải…" : "Xem thêm"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CloudDivider className="mx-auto max-w-md text-gold/70" />
    </main>
  );
}
