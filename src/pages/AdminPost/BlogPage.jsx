import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getAllPosts } from "../../api/posts";
import { Button, Card, EmptyState, Skeleton } from "../../ui";
import { KoiSilhouette } from "../../assets/motifs/Motifs";

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function PostCard({ post }) {
  const imageUrl = post.imageUrls?.[0];

  return (
    <Card interactive className="h-full overflow-hidden">
      <Link
        to={`/blog/${post.postId ?? post.id}`}
        aria-label={`Đọc bài: ${post.name}`}
        className="group block h-full w-full rounded-lg text-left outline-none focus-visible:shadow-gold"
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
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gold/60">
              <KoiSilhouette size={56} flip />
              <span className="text-xs text-muted">Chưa có ảnh</span>
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-display text-lg font-semibold text-ink">
            {post.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {stripHtml(post.description)}
          </p>
          <span className="text-sm font-semibold text-crimson transition-colors duration-fast group-hover:text-crimson-deep">
            Đọc thêm <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    description: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

function PostSkeletonGrid() {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPosts();
        if (cancelled) return;
        setPosts(
          (response.data ?? []).filter((post) => post.status === "active")
        );
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
  }, [reloadToken]);

  const handleRetry = () => setReloadToken((token) => token + 1);

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <section className="animate-fade-rise mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20 lg:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
          Kinh Nghiệm Hay
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Ghi chú và kinh nghiệm chăm sóc cá Koi.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <PostSkeletonGrid />
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
        ) : posts.length === 0 ? (
          <EmptyState
            title="Chưa có bài viết nào"
            description="Các bài viết sẽ xuất hiện tại đây khi được đăng."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.postId ?? `${post.id}-${post.name}`}
                post={post}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
